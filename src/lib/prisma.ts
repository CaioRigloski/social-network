import { PrismaClient } from "@prisma/client"
 
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
export const prisma = globalForPrisma.prisma || new PrismaClient()
 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Query selects
export const userSelect = {
  id: true,
  username: true,
  profilePicture: true
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
  ...userSelect,
  posts: {
    select: {
      id: true,
      picture: true,
      comments: {
        select: {
          ...commentSelect
        }
      },
      likes: {
        select: {
          ...likeSelect
        }
      }
    }
  }
}

export const messageSelect = {
  id: true,
  user: userSelect,
  chatId: true,
  text: true,
  createdAt: true
}

export const frendSuggestionsSelect= {
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