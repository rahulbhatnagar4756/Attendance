const express = require('express');
const { auth } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { importantDatesController } = require('../../controllers');
const { importantDatesValidation } = require('../../validations');

const router = express.Router();
router
  .route('/add')
  .post(auth('addImportantDates'), validate(importantDatesValidation.addDates), importantDatesController.addDates);
router.route('/get').get(auth('getImportantDates'), importantDatesController.getDates);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Important Dates
 *   description: Important Dates
 */

/**
 * @swagger
 * path:
 *  /important-dates/add:
 *    post:
 *      summary: Add Event
 *      tags: [Important Dates]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - date
 *                - event
 *              properties:
 *                date:
 *                  type: date
 *                event:
 *                  type: string
 *              example:
 *                date: 2oct2021
 *                event: Gandhi Jayanti
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  event:
 *                    $ref: '#/components/schemas/Important_Dates'
 *        "401":
 *          description: Forbidden
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
 *  /important-dates/get:
 *    get:
 *      summary: Get Events
 *      tags: [Important Dates]
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  event:
 *                    $ref: '#/components/schemas/Important_Dates'
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