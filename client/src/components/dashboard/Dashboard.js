import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getCurrentProfile } from "../../actions/profileActions";
import Spinner from "../common/Spinner";
class Dashboard extends Component {
  componentDidMount() {
    this.props.getCurrentProfile();
  }
  render() {
    const { user } = this.props.auth;
    const { profile, loading } = this.props.profile;
    let dashboardContent;

    if (profile === null || loading === true) {
      dashboardContent = <Spinner />;
    } else {
      dashboardContent = (
        <div>
          <h1 className="large text-primary">Dashboard</h1>
          <p className="lead">
            <i className="fas fa-user">Welcome {user && user.name}</i>
          </p>
          {profile ? <p>has</p> : <p>has not</p>}
        </div>
      );
    }
    return (
      <div className="dashboard">
        <div className="container">
          <div className="row">
            <div className="col-md-12">{dashboardContent}</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth
});

Dashboard.prototypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};
export default connect(
  mapStateToProps,
  { getCurrentProfile }
)(Dashboard);
