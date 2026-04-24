const express = require('express');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const { attendenceController } = require('../../controllers');
const { attendenceValidation } = require('../../validations');

const router = express.Router();

router.route('/current-date').get(attendenceController.getCurrentDate);
router.route('/get-attendence').get(auth('getAttendenceOfDay'), attendenceController.getAttendenceOfDay);
router
  .route('/get-current-session/:userId')
  .get(
    auth('getUserCurrentSession'),
    validate(attendenceValidation.getCurrentMonthAttendence),
    attendenceController.getUserCurrentSession
  );
router
  .route('/get-current-month-attednence/:userId')
  .get(
    auth('getCurrentMonthAttendence'),
    validate(attendenceValidation.getCurrentMonthAttendence),
    attendenceController.getCurrentMonthAttendence
  );
router
  .route('/get-selected-range-attednence/:userId')
  .post(auth('getCurrentMonthAttendence'), attendenceController.getSelectedRangeAttendence);
router.route('/remove-timeout/:attandenceId').post(auth('removeTimeout'), attendenceController.removeTimeout);
router.route('/remove-break/:id').post(auth('removeBreak'), attendenceController.removeBreak);
router.route('/update-attednence/:userId').put(auth('updateAttendence'), attendenceController.updateAttendence);

router.route('/add-new-attendence/:userId').put(auth('addNewAttendence'), attendenceController.addNewAttendence);

router
  .route('/get-specific-date-attendence')
  .get(auth('getAttendenceOfDay'), attendenceController.getAttendenceOfSpecificDate);
router.route('/check-in').post(auth('checkIn'), validate(attendenceValidation.checkIn), attendenceController.checkIn);
router.route('/check-out').put(auth('checkOut'), validate(attendenceValidation.checkOut), attendenceController.checkOut);
router
  .route('/break-start')
  .put(auth('breakStart'), validate(attendenceValidation.breakStart), attendenceController.breakStart);
router.route('/break-end').put(auth('breakEnd'), attendenceController.breakEnd);
router.route('/today-present-count').get(auth('getTodayPresentCount'), attendenceController.presentUserCount);
router.route('/today-report').get(auth('getTodayReport'), attendenceController.todayReport);
router.route('/today-wfh-report').get(auth('getTodayWfhReport'), attendenceController.todayWfhReport);
router.route('/today-team-report').get(auth('getTodayTeamReport'), attendenceController.todayTeamReport);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Attendence
 *   description: Attendence data
 */

/**
 * @swagger
 * path:
 *  /attendence/check-in:
 *    post:
 *      summary: Check In
 *      tags: [Attendence]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - on_leave
 *                - work_from
 *              properties:
 *                on_leave:
 *                  type: boolean
 *              work_from:
 *                  type: string
 *              example:
 *                on_leave: false
 *                work_from: home
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/Attendence'
 *        "401":
 *          description: Invalid email or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Forbidden
 */
/**
 * @swagger
 * path:
 *  /attendence/get-attendence:
 *    get:
 *      summary: Get Attendence Of Same Day
 *      tags: [Attendence]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *              example:
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/Attendence'
 *        "401":
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Not Found
 */
/**
 * @swagger
 * path:
 *  /attendence/check-out:
 *    put:
 *      summary: Check Out
 *      tags: [Attendence]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - check_out
 *              properties:
 *              example:
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/Attendence'
 *        "401":
 *          description: Invalid email or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Forbidden
 */
/**
 * @swagger
 * path:
 *  /attendence/break-start:
 *    put:
 *      summary: Break Start
 *      tags: [Attendence]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - reason
 *              properties:
 *                reason:
 *                   type: string
 *              example:
 *                reason: any
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/Attendence'
 *        "401":
 *          description: Invalid email or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Forbidden
 */
/**
 * @swagger
 * path:
 *  /attendence/break-end:
 *    put:
 *      summary: Break End
 *      tags: [Attendence]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *              properties:
 *              example:
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/Attendence'
 *        "401":
 *          description: Invalid email or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Forbidden
 */
