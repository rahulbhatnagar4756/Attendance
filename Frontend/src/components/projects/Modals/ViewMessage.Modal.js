import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { httpClient } from "../../../constants/Api";
import { PROJECT } from "../../../constants/AppConstants";
import { Modal, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
function ViewMessageModal(props) {
    const {
        show,
        onHide,
    } = props;
    const { projectId } = useParams();
    const [projectUpdateDetail, setProjectUpdateDetails] = useState("");

    useEffect(() => {
        getProjectUpdateDetail();
    }, []);

    const getProjectUpdateDetail = async () => {
        try {
            const res = await httpClient
                .get(PROJECT.GET_PROJECT_DETAILS_BY_ID.replace("{projectId}", projectId))
            if (res.status === 200) {
                setProjectUpdateDetails(res.data.result);
            }
        } catch (err) {
            if (err?.response) {
                toast.error(err?.response?.data?.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide}  centered>
                <Modal.Header>
                    <Modal.Title>{show?.data?.subject}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p dangerouslySetInnerHTML={{
                        __html: show?.data?.message
                            .replaceAll("&lt;", "<")
                            .replaceAll("&gt;", ">"),
                    }}></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ViewMessageModal;
