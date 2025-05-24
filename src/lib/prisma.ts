import { PrismaClient } from "@prisma/client"
 
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
export const prisma = globalForPrisma.prisma || new PrismaClient()
 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Query selects
export const userSelect = {
  id: true,
  username: true,
  profilePicture: true,
  createdAt: true
}

export const commentSelect = {
  id: true,
  text: true,
  user: {
    select: userSelect
  }
}

export const likeSelect = {
  id: true,
  user: {
    select: userSelect
  }
}

export const postSelect = {
  id: true,
  picture: true,
  description: true,
  createdAt: true,
  user: {
    select: userSelect,
  },
  comments: {
    select: commentSelect,
  },
  likes: {
    select: likeSelect,
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
}

export const userPostsSelect = {
  ...userSelect,
  posts: {
    select: {
      id: true,
      picture: true,
      description: true,
      createdAt: true,
      comments: {
        select: {
          ...commentSelect
        }
      },
      likes: {
        select: {
          ...likeSelect
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  }
}

export const messageSelect = {
  id: true,
  user: {
    select: userSelect
  },
  chatId: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  deleted: true
}

export const friendSuggestionsSelect= {
  friends: {
    select: {
      id: true
    }
  },
  friendOf: {
    select: {
      id: true
    }
  },
  friendRequestOf: {
    select: {
      id: true
    }
  },
  friendRequests: {
    select: {
      id: true
    }
  }
}