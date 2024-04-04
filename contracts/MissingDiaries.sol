// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


contract MissingDiaries {

    enum Status { Missing, Found }

    struct MissingPerson {
        uint id;
        string name;
        uint age;
        uint height;
        Status status;
        string description;
        string division;
        string relative;
    }

    mapping(uint => MissingPerson) public missingPeople;

    uint public missingPeopleCount;

    event missingPersonAdded(uint indexed _missingPersonId, string _name, uint _age, uint _height, Status _status, string _description, string _division, string _relative);
    event statusToggled(uint indexed _missingPersonId, Status _newStatus);

    constructor() {
        addMissingPerson("John Doe", 25, 180, Status.Found, "John Doe is missing since 2nd January 2021", "Dhaka", "Jane Doe");
        addMissingPerson("Jane Doe", 20, 160, Status.Missing, "Jane Doe is missing since 2nd January 2021", "Dhaka", "John Doe");
    }

    function addMissingPerson(string memory _name, uint _age, uint _height, Status _status, string memory _description, string memory _division, string memory _relative) public {
        missingPeopleCount++;
        missingPeople[missingPeopleCount] = MissingPerson(missingPeopleCount, _name, _age, _height, _status, _description, _division, _relative);
        emit missingPersonAdded(missingPeopleCount, _name, _age, _height, _status, _description, _division, _relative);
    }

    function foundPerson(uint _id) public {
        // msg.sender;
        missingPeople[_id].status = Status.Found;
    }

    function getCount() public view returns (uint[8] memory) {
        string[8] memory districts = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];
        uint[8] memory result;
        for (uint i = 0; i < 8; i++) {
            result[i] = getCountByDistrict(districts[i]);
        }
        return result;
    }

    function getCountByDistrict(string memory _district) public view returns (uint) {
        uint counter = 0;
        for (uint i = 1; i <= missingPeopleCount; i++) {
            if ((keccak256(bytes(missingPeople[i].division)) == keccak256(bytes(_district))) && (missingPeople[i].status == Status.Missing)) {
                counter++;
            }
        }
        return counter;
    }

}