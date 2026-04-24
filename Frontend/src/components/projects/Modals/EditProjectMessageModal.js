import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import { PROJECT } from '../../../constants/AppConstants';
import { Modal } from 'react-bootstrap';
import CkEditor from '../../common/CkEditor';
import getAllUsers from '../../common/GetAllUser';

function EditProjectMessageModal(props) {
  const { show, onHide, selectedRecipients } = props;
  const [values, setValues] = useState({
    message: show.data.message,
    messageId: show.data._id,
    recipients: show.data.recipients,
    projectId: show.data.project_id._id,
    subject: show.data.subject_id.subject,
    subject_id: show.data.subject_id._id
  });
  const [inputFields, setInputFields] = useState([...selectedRecipients]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState([]);

  useEffect(async () => {
    const { userId } = await getAllUsers();
    setUserId(userId);
  }, []);

  const validation = () => {
    let valid = true;
    if (!values.message.trim()) {
      toast.error('Please type Message');
      valid = false;
    }
    return valid;
  };

  const updateProjectMessage = async () => {
    if (message) {
      values.message = message;
    }
    try {
      const valid = validation();
      if (valid) {
        const res = await httpClient.put(PROJECT.UPDATE_PROJECT_MESSAGE.replace('{projectMessageId}', values.messageId), values);
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
          <div className="row justify-content-center  modal-lg">
            <div className="col-12">
              <div className="header_title pb-2 pt-2">
                <input
                  className="form-control text_box_outline border-0 fw-bolder"
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
                <button type="button" className="btn btn-primary text-center px-4 mx-2" onClick={updateProjectMessage}>
                  Post this message
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EditProjectMessageModal;
