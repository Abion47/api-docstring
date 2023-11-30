/**
 * @apiProto {rest}
 * @apiDefine LocalDefine
 * @apiHeader {String} Content-Type=application/json
 * The MIME type of the contents of the request.
 */

/**
 * @apiProto {rest}
 * @api {GET} /users
 * @apiName Get users
 * @apiShortName GetUsers
 *
 * @apiParam {Integer} limit?=20
 * The maximum number of users to return.
 * Foo
 * Bar
 *
 * Baz
 *
 * @apiSuccess {Object[]} users
 * The list of users.
 * @apiSuccess {String} users[].id
 * The ID of the user.
 *
 * @apiExample {json} "Get users example"
 * GET /users HTTP/1.1
 * {
 *   limit: 10
 * }
 */
