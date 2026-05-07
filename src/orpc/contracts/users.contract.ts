import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'
import {
  authorProfileSchema,
  getAuthorByUsernameParamsSchema,
  getUserByUsernameParamsSchema,
  userProfileSchema,
} from '#/schemas/users.schema'

const getAuthorByUsernameContract = base
  .route({
    path: '/users/{username}/profile',
    method: 'GET',
    summary: 'Get author profile by username',
    description:
      'Retrieve full author profile data including bio, metadata, and profile details.',
    tags: ['Users'],
    operationId: 'getAuthorByUsername',
    successStatus: 200,
    successDescription: 'Author profile retrieved successfully',
  })
  .input(getAuthorByUsernameParamsSchema)
  .output(authorProfileSchema)

const getUserByUsernameContract = base
  .route({
    path: '/users/{username}',
    method: 'GET',
    summary: 'Get user profile by username',
    description:
      'Retrieve full user profile data including bio, metadata, and profile details.',
    tags: ['Users'],
    operationId: 'getUserByUsername',
    successStatus: 200,
    successDescription: 'User profile retrieved successfully',
  })
  .input(getUserByUsernameParamsSchema)
  .output(userProfileSchema)

export const usersContract = {
  getAuthorByUsername: getAuthorByUsernameContract,
  getUserByUsername: getUserByUsernameContract,
}
