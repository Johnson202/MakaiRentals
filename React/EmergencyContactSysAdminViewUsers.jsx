import React, { useState, useEffect } from "react";
import debug from "sabio-debug";
import userService from "../../services/userService.js";
import EmergencyContactSysAdminViewUserEntry from "./EmergencyContactSysAdminViewUserEntry";
import { Table } from "react-bootstrap";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import toastr from "toastr";
import "toastr/build/toastr.css";
import lookUpService from "services/lookUpService";

const _logger = debug.extend("EmergencyContactSysAdminViewUsers");

function EmergencyContactSysAdminViewUsers() {
  const [usersState, setUsersState] = useState({
    arrayOfUsers: [],
    arrayOfUsersComponents: [],
    totalNumUsers: 0,
    show: false,
    page: {
      current: 1,
      currentIndex: 0,
    },
    statusTypes: [],
    searchTerm: "",
    termToSearch: "",
    searchExecuted: false,
  });

  useEffect(() => {
    lookUpService
      .LookUp(["StatusTypes"])
      .then(onLookupSuccess)
      .catch(onLookupError);
  }, []);

  useEffect(() => {
    if (usersState.statusTypes.length > 0) {
      if (!usersState.termToSearch && !usersState.searchExecuted) {
        getAllUsers();
      } else {
        getUsersByUserNameChangePage();
      }
    }
  }, [usersState.page.currentIndex, usersState.statusTypes]);

  const getUsersByUserNameChangePage = () => {
    userService
      .onGetUsersByUserName(
        usersState.page.currentIndex,
        10,
        usersState.termToSearch
      )
      .then(onGetUsersByUserNameChangePageSuccess)
      .catch(onGetUsersByUserNameError);
  };

  const onLookupSuccess = (data) => {
    _logger(data);
    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.statusTypes = data.item.statusTypes;
      return newState;
    });
  };

  const onLookupError = (err) => {
    _logger(err);
    toastr.err(
      "Couldn't find status types! Try reloading the page or logging in again...",
      `${err}`
    );
  };

  const onPageChange = (newPage) => {
    _logger(`current page: ${JSON.stringify(usersState.page)}`);
    _logger(`changing page.current to: ${newPage}`);

    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.page.current = newPage;
      newState.page.currentIndex = newPage - 1;
      return newState;
    });
  };

  const getAllUsers = () => {
    _logger(`current page: ${JSON.stringify(usersState.page)}`);

    userService
      .onGetUsers(usersState.page.currentIndex, 10)
      .then(onGetAllUsersSuccess)
      .catch(onGetAllUsersError);
  };

  const onGetAllUsersSuccess = (data) => {
    _logger(`data: ${JSON.stringify(data)}`);
    _logger(`total number of users: ${data.item.totalCount}`);

    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.totalNumUsers = data.item.totalCount;
      newState.arrayOfUsers = data.item.pagedItems;
      newState.arrayOfUsersComponents = newState.arrayOfUsers.map(mapUserEntry);
      if (!newState.show) {
        newState.show = true;
      }
      return newState;
    });
  };

  const onGetAllUsersError = (err) => {
    _logger(JSON.stringify(err));
    toastr.error(
      "Retrieval of Users Unsuccessful! Try reloading the page or logging in again...",
      `${err}`
    );
  };

  const onSearchTermChange = (evt) => {
    const target = evt.target;
    const newValue = target.value;
    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.searchTerm = newValue;
      return newState;
    });
  };

  const onSearchUserNameClicked = (evt) => {
    _logger(evt);
    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.termToSearch = newState.searchTerm;
      return newState;
    });

    userService
      .onGetUsersByUserName(0, 10, usersState.searchTerm)
      .then(onGetUsersByUserNameSuccess)
      .catch(onGetUsersByUserNameError);
  };

  const onGoToAllUsersClicked = (evt) => {
    _logger(evt);
    getAllUsersAgain();
  };

  const getAllUsersAgain = () => {
    userService
      .onGetUsers(0, 10)
      .then(onGetAllUsersAgainSuccess)
      .catch(onGetAllUsersError);
  };

  const onGetAllUsersAgainSuccess = (data) => {
    _logger(`data: ${JSON.stringify(data)}`);
    _logger(`total number of users: ${data.item.totalCount}`);

    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.totalNumUsers = data.item.totalCount;
      newState.arrayOfUsers = data.item.pagedItems;
      newState.arrayOfUsersComponents = newState.arrayOfUsers.map(mapUserEntry);
      if (newState.searchTerm !== "") {
        newState.searchTerm = "";
      }
      if (newState.termToSearch !== "") {
        newState.termToSearch = "";
      }

      if (newState.searchExecuted) {
        newState.searchExecuted = false;
      }
      newState.page = { ...prevState.page };
      newState.page.current = 1;
      newState.page.currentIndex = 0;
      return newState;
    });
  };

  const onGetUsersByUserNameSuccess = (data) => {
    _logger(data);
    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.arrayOfUsers = data.item.pagedItems;
      newState.arrayOfUsersComponents = newState.arrayOfUsers.map(mapUserEntry);
      newState.totalNumUsers = data.item.totalCount;
      newState.searchExecuted = true;
      newState.page = { ...prevState.page };
      newState.page.current = 1;
      newState.page.currentIndex = 0;
      return newState;
    });
  };

  const onGetUsersByUserNameChangePageSuccess = (data) => {
    _logger(data);
    setUsersState((prevState) => {
      const newState = { ...prevState };
      newState.arrayOfUsers = data.item.pagedItems;
      newState.arrayOfUsersComponents = newState.arrayOfUsers.map(mapUserEntry);
      newState.totalNumUsers = data.item.totalCount;
      newState.searchExecuted = true;
      return newState;
    });
  };

  const onGetUsersByUserNameError = (err) => {
    _logger(err);
    const errString = String(err);
    if (
      errString.slice(errString.length - 3, errString.length) === String(404)
    ) {
      toastr.info("No users found!", "No users with that name exist...");
    }
  };

  const onChangeUserStatusIsSuccessful = (statusTypeId, userId) => {
    setUsersState((prevState) => {
      const newState = { ...prevState };
      const idxOfUser = newState.arrayOfUsers.findIndex((user) => {
        return user.id === userId;
      });

      const idxOfStatusType = newState.statusTypes.findIndex((statusType) => {
        return statusType.id === statusTypeId;
      });

      newState.arrayOfUsers[idxOfUser] = {
        ...prevState.arrayOfUsers[idxOfUser],
      };
      newState.arrayOfUsersComponents[idxOfUser] = {
        ...prevState.arrayOfUsersComponents[idxOfUser],
      };

      const newStatusTypeName = newState.statusTypes[idxOfStatusType].name;

      newState.arrayOfUsers[idxOfUser].statusType = {
        id: statusTypeId,
        name: newStatusTypeName,
      };
      newState.arrayOfUsers[idxOfUser];
      newState.arrayOfUsersComponents[idxOfUser] = mapUserEntry(
        newState.arrayOfUsers[idxOfUser]
      );
      return newState;
    });
  };

  const onChangeUserStatusError = (err) => {
    _logger(err);
    toastr.error(
      "User status change unsuccessful! Try reloading the page or logging in again...",
      `${err}`
    );
  };

  const onRenderChangeToStatus = (payload) => {
    const onChangeUserStatusSuccess = (data) => {
      _logger(`data: ${JSON.stringify(data)}`);
      onChangeUserStatusIsSuccessful(payload.statusId, payload.id);
    };
    userService
      .changeUserStatus(payload)
      .then(onChangeUserStatusSuccess)
      .catch(onChangeUserStatusError);
  };

  const mapUserEntry = (aUser) => {
    _logger("mapping-->", JSON.stringify(aUser));

    return (
      <React.Fragment key={"user-" + aUser.id}>
        <EmergencyContactSysAdminViewUserEntry
          user={aUser}
          statusTypes={usersState?.statusTypes}
          renderChangeToStatus={onRenderChangeToStatus}
        ></EmergencyContactSysAdminViewUserEntry>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {usersState.show && (
        <React.Fragment>
          <div className="row">
            <div className="float-left col-2">
              <h1>
                <strong>Users</strong>
              </h1>
            </div>
            <div className="col-2" />
            <div className="float-right col-8 mt-2">
              <div className="search-bar">
                <div className="input-group mb-3">
                  <input
                    className="form-control form-searchCat me-2"
                    type="text"
                    aria-label="userNameQuery"
                    aria-describedby="button-addon2"
                    onChange={onSearchTermChange}
                    value={usersState?.searchTerm}
                    placeholder="e.g., Bob"
                  />
                  <button
                    className="btn btn-primary mx-auto"
                    type="button"
                    id="button-addon2"
                    onClick={onSearchUserNameClicked}
                  >
                    Search User Name
                  </button>
                  <button
                    className="btn btn-secondary mx-auto ms-2"
                    type="button"
                    id="button-addon2"
                    onClick={onGoToAllUsersClicked}
                  >
                    Go To All Users
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Table className="text-12" striped responsive>
            <thead>
              <tr>
                <th scope="col">Avatar URL</th>
                <th scope="col">Last Name</th>
                <th scope="col">First Name</th>
                <th scope="col">Middle Initial</th>
                <th scope="col">Email</th>
                <th scope="col">DOB</th>
                <th scope="col">Roles</th>
                <th scope="col">Status</th>
                <th className="text-end" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>{usersState.arrayOfUsersComponents}</tbody>
          </Table>
          <Pagination
            onChange={onPageChange}
            current={usersState.page.current}
            total={usersState.totalNumUsers}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default EmergencyContactSysAdminViewUsers;
