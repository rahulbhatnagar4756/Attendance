import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import { PROJECT } from '../../../constants/AppConstants';
import { Modal } from 'react-bootstrap';
import CkEditor from '../../common/CkEditor';

function DailyStatusModal(props) {
  const { show, onHide, type, userId } = props;

  const [values, setValues] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
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
  const submitData = async (e) => {
    values.type = type;
    values.recipients = userId;

    try {
      const valid = validation();
      if (valid) {
        await httpClient.post(PROJECT.ADD_DAILY_STATUS, values).then(async (res) => {
          if (res.status === 200) {
            toast.success('Message posted successfully');
            props.getDailyStatus(1, true);
            onHide();
          }
        });
      }
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching user detail');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* <div className="customModal" show={show} onHide={onHide} centered size="lg">
                  <div className="modal-lg"> */}
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Body>
          <div className="row justify-content-center  modal-lg">
            <div className="col-12">
              <div className="header_title pb-2 pt-2">
                <input
                  className="form-control text_box_outline border-0"
                  type="text"
                  placeholder="Type the subject of this message..."
                  value={values.subject}
                  onChange={(e) => setValues({ ...values, subject: e.target.value })}
                  required
                ></input>
              </div>
              <div className="ck-body-wrapper">
                <CkEditor values={values} setValues={setValues}/>
              </div>
              <div className="mt-5 text-end">
                <button type="button" className="btn btn-outline-secondary text-center px-4 mx-2" onClick={onHide}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary text-center px-4 mx-2" onClick={submitData}>
                  Post this message
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/* </div>
                    </div>            */}
    </>
  );
}

export default DailyStatusModal;
