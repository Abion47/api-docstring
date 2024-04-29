/**
 * @apiProto {rest}
 * @apiDefine DefaultHeaders
 *
 * @apiHeader Content-Type=application/json
 * @apiSuccessHeader Content-Type=application/json
 */

/**
 * @apiProto {rest}
 * @api {get} /users/{userId}
 * @apiName Get User By ID
 * @apiShortName GetUserById
 * @apiDescription
 * Gets a user object via the user's ID
 *
 * @apiUse DefaultHeaders
 * @apiUse GlobalDefine
 *
 * @apiParam {UUID} userId
 * The user's ID
 *
 * @apiSuccess {UUID} id
 * The user's ID
 * @apiSuccess {String} fullname
 * The user's full name
 * @apiSuccess {String} dob
 * The user's date of birth
 * @apiSuccess {Boolean} disabled?=false
 * Whether the user has been disabled
 * @apiSuccess {String[]} aliases?
 * A list of the user's known aliases
 */

/**
 * @apiProto {rest}
 * @api {put} /users/create
 * @apiName Create New User
 * @apiShortName CreateUser
 * @apiDescription
 * Creates a new user and returns the user's ID
 *
 * @apiUse DefaultHeaders
 *
 *
 * @apiBody {String} fullname
 * The user's full name
 * @apiBody {String} dob
 * The user's date of birth
 * @apiBody {Boolean} disabled?=false
 * Whether the user has been disabled
 * @apiBody {String[]} aliases?
 * A list of the user's known aliases
 *
 * @apiSuccess {UUID} userId
 * The user's ID
 */

/**
 * @apiProto {rest}
 * @api {post} /users/{userId}/upload
 * @apiName Upload File For User By User ID
 * @apiShortName UploadFileByUserID
 * @apiDescription
 * Uploads a file for a user assocated with the given ID.
 *
 * @apiUse DefaultHeaders
 *
 * @apiParam {UUID} userId
 * The user's ID
 *
 * @apiBinaryBody 10000
 *
 * @apiSuccess {String} message=OK
 * OK Response
 */
