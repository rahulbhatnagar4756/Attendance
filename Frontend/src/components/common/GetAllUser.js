import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import { ORGANISATION } from "../../constants/AppConstants";

const getAllUsers = async () => {
  try {
    const users = await httpClient.get(ORGANISATION.GET_ALL_EMPLOYEES);
    const usersList = users.data.result;

    const Labels = usersList.map((data) => {
      return { label: `${data.name} (${data.emp_id})`, value: '' };
    });

    const LabelswithId = usersList.map((data) => {
      return { label: `${data.name} (${data.emp_id})`, value: data.id };
    });

    return {
      userId: LabelswithId,
      options: Labels,
    };
  } catch (err) {
    if (err.response) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Error in fetching user detail");
    }
    return {
      userId: [],
      options: [],
    };
  }
};

export default getAllUsers;
