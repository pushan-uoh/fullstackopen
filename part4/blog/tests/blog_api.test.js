const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token = ''
let userId = ''

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  const savedUser = await user.save()
  userId = savedUser._id.toString()

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id,
  }
  token = jwt.sign(userForToken, process.env.SECRET)

  const blogsWithUser = helper.initialBlogs.map((b) => ({
    ...b,
    user: savedUser._id,
  }))
  await Blog.insertMany(blogsWithUser)
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json and correct amount is returned', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogToVerify = response.body[0]

    assert.ok(blogToVerify.id)
    assert.strictEqual(blogToVerify._id, undefined)
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added when token is provided', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert.ok(titles.includes('Canonical string reduction'))
  })

  test('adding a blog fails with status code 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Unauthorized blog',
      author: 'Anonymous',
      url: 'http://unauthorized.com',
      likes: 0,
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.error.includes('token missing'))

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlogWithoutLikes = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)

    const blogsAtEnd = await helper.blogsInDb()
    const savedBlog = blogsAtEnd.find((b) => b.title === 'First class tests')
    assert.strictEqual(savedBlog.likes, 0)
  })

  test('fails with status code 400 if title is missing', async () => {
    const newBlogWithoutTitle = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogWithoutTitle)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status code 400 if url is missing', async () => {
    const newBlogWithoutUrl = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if user is creator and token is provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const ids = blogsAtEnd.map((b) => b.id)
    assert.ok(!ids.includes(blogToDelete.id))
  })

  test('fails with status code 401 if token is not provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status code 403 if another user tries to delete the blog', async () => {
    const anotherPasswordHash = await bcrypt.hash('secret2', 10)
    const anotherUser = new User({ username: 'another', name: 'Other User', passwordHash: anotherPasswordHash })
    const savedAnotherUser = await anotherUser.save()

    const anotherToken = jwt.sign(
      { username: savedAnotherUser.username, id: savedAnotherUser._id },
      process.env.SECRET
    )

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds with status code 200 when updating likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 10,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlogInDb = blogsAtEnd.find((b) => b.id === blogToUpdate.id)
    assert.strictEqual(updatedBlogInDb.likes, blogToUpdate.likes + 10)
  })

  test('fails with status code 404 if blog does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()
    const updateData = {
      title: 'Non-existing Blog',
      author: 'Ghost Writer',
      url: 'http://ghost.com',
      likes: 1,
    }

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send(updateData)
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})
