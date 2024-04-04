// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract PatientManagement {

    enum Status {
        not_vaccinated,
        one_dose,
        two_dose
    }

    struct User {
        uint id;
        uint age;
        string gender;
        Status vaccine_status;
        string district;
        string symptom_details;
        bool is_dead;
        bool is_admin;
    }

    mapping(address => User) public user;

    uint public userCount;

    constructor() {
        address res = 0x2C56A95C8102FC728F3938e22A5647ef59521F53;
        user[res] = User(0,5,"male",Status.one_dose,"sdgsdg","sdfsdf",false,true);
    }

    function addUser(
        uint _age,
        string memory _gender,
        Status _vaccine_status,
        string memory _district,
        string memory _symptom_details,
        bool _is_dead
    ) public {
        userCount++;
        user[msg.sender] = User(
            userCount,
            _age,
            _gender,
            _vaccine_status,
            _district,
            _symptom_details,
            _is_dead,
            false
        );
        
    }

    function checkAdmin() public view returns (bool){
        return user[msg.sender].is_admin;
    }

    function setAdmin() public {
        user[msg.sender].is_admin = true;
    }

    function updateUser(address _address, Status _vaccine_status, bool _is_dead) public {
        if(user[msg.sender].is_admin){
            user[_address].vaccine_status = _vaccine_status;
            user[_address].is_dead = _is_dead;
        }
    }



    // function updateStatus(uint _id, Status _status) public {
    //     // msg.sender;
    //     user[_id].vaccine_status = _status;
    // }
}
