import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ReactLoading from 'react-loading';

function Loader({ show, onHide }) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Modal show={show} onHide={onHide}>
        <Modal.Body>
          <div style={{ textAlign: '-webkit-center' }}>
            <label>Loading....</label>
            <ReactLoading type="spokes" color="red" />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Loader;
