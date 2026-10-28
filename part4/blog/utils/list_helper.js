const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((prev, current) => {
    return (current.likes > prev.likes) ? current : prev
  })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const blogCounts = {}
  blogs.forEach((blog) => {
    blogCounts[blog.author] = (blogCounts[blog.author] || 0) + 1
  })

  let topAuthor = ''
  let maxBlogs = 0

  for (const [author, count] of Object.entries(blogCounts)) {
    if (count > maxBlogs) {
      maxBlogs = count
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    blogs: maxBlogs,
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likeCounts = {}
  blogs.forEach((blog) => {
    likeCounts[blog.author] = (likeCounts[blog.author] || 0) + (blog.likes || 0)
  })

  let topAuthor = ''
  let maxLikes = 0

  for (const [author, total] of Object.entries(likeCounts)) {
    if (total > maxLikes) {
      maxLikes = total
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    likes: maxLikes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
