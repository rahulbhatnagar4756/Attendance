import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import { PROJECT } from '../../../constants/AppConstants';
import { Modal } from 'react-bootstrap';
import CkEditor from '../../common/CkEditor';
import getAllUsers from '../../common/GetAllUser';

function EditMessageModal(props) {
  const { show, onHide, selectedRecipients, createdBy } = props;

  const [values, setValues] = useState({ subject: show.data.subject_id.subject, message: show.data.message, subject_id: show.data.subject_id._id, userId: show.data.user_id.id });
  const [message, setMessage] = useState('');
  const [inputFields, setInputFields] = useState([...selectedRecipients, ...createdBy]);
  const [userId, setUserId] = useState([]);

  useEffect(async () => {
    const { userId } = await getAllUsers();
    setUserId(userId);
  }, []);

  const messageId = show.data._id;

  const validation = () => {
    let valid = true;
    if (!values.subject.trim()) {
      toast.error('Please type Subject');
      valid = false;
    } else if (!values.message.trim()) {
      toast.error('Please type Message');
      valid = false;
    }
    return valid;
  };
  const updateMessage = async () => {
    if (message) {
      values.message = message;
    } else {
      values.message = show.data.message;
    }
    try {
      const valid = validation();
      if (valid) {
        const res = await httpClient.put(PROJECT.UPDATE_MESSAGE.replace('{messageId}', messageId), values);
        if (res.status === 200) {
          toast.success('Message Updated successfully');
          onHide();
          if (Object.keys(res.data).length > 0 && res.data.result.isuserTagged) {
            await httpClient.post(PROJECT.SEND_MAIL_TO_TAGGED_USERS, res.data.result.emailData);
          }
        }
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Body>
          {/* <div className="customModal" show={show} onHide={onHide} centered size="lg">
        <div className="modal-lg"> */}
          <div className="row justify-content-center modal-lg">
            <div className="col-12">
              <div className="header_title pb-2 pt-2">
                <input
                  className="form-control text_box_outline border-0 fw-bolder "
                  type="text"
                  placeholder="Type the subject of this message..."
                  value={values.subject}
                  onChange={(e) => setValues({ ...values, subject: e.target.value })}
                  readOnly
                ></input>
              </div>
              <div className="ck-body-wrapper">
                <CkEditor values={values} setValues={setValues} setMessage={setMessage} inputFields={inputFields} userId={userId} type="edit" />
              </div>
              <div className="mt-5 text-end">
                <button type="button" className="btn btn-outline-secondary text-center px-4 mx-2" onClick={onHide}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary text-center px-4 mx-2" onClick={updateMessage}>
                  Post this message
                </button>
              </div>
            </div>
          </div>
          {/* </div>
      </div> */}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditMessageModal;
