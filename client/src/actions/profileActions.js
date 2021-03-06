import axios from "axios";
import {
  GET_PROFILE,
  PROFILE_LOADING,
  GET_ERRORS,
  CLEAR_CURRENT_PROFILE,
  SET_CURRENT_USER
} from "./types";

//get current profile

export const getCurrentProfile = () => dispatch => {
  dispatch(setProfileLoading());
  axios
    .get("/api/profile")
    .then(response => {
      dispatch({
        type: GET_PROFILE,
        payload: response.data
      });
    })
    .catch(err => {
      console.log("entered into err", err);
      dispatch({
        type: GET_PROFILE,
        payload: {}
      });
    });
};

//create profile
export const createProfile = (profileData, history) => dispatch => {
  axios
    .post("/api/profile", profileData)
    .then(res => history.push("/dashboard"))
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};
// set profile loading
export const setProfileLoading = () => {
  return {
    type: PROFILE_LOADING
  };
};

//clear current profile
export const clearCurrentProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  };
};

//delete account & profile
export const deleteAccount = () => dispatch => {
  if (window.confirm("Are you sure? This cannot be undone!")) {
    axios
      .delete("api/profile")
      .then(res =>
        dispatch({
          type: SET_CURRENT_USER,
          payload: {}
        })
      )
      .catch(err => {
        dispatch({ type: GET_ERRORS, payload: err.response.data });
      });
  }
};
