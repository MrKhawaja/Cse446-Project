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

    event missingPersonAdded(uint id, string name, uint age, uint height, Status status, string description, string division, string relative);

    constructor() {
        addMissingPerson("John Doe", 25, 180, Status.Missing, "John Doe is missing since 2nd January 2021", "Dhaka", "Jane Doe");
        addMissingPerson("Jane Doe", 20, 160, Status.Missing, "Jane Doe is missing since 2nd January 2021", "Dhaka", "John Doe");
    }

    function addMissingPerson(string memory _name, uint _age, uint _height, Status _status, string memory _description, string memory _division, string memory _relative) public {
        missingPeopleCount++;
        missingPeople[missingPeopleCount] = MissingPerson(missingPeopleCount, _name, _age, _height, _status, _description, _division, _relative);
        emit missingPersonAdded(missingPeopleCount, _name, _age, _height, _status, _description, _division, _relative);
    }

    function getMissingPersons() public view returns (MissingPerson[] memory) {
        MissingPerson[] memory missingPersons = new MissingPerson[](missingPeopleCount);
        for (uint i = 0; i < missingPeopleCount; i++) {
            missingPersons[i] = missingPeople[i + 1];
        }
        return missingPersons;
    }

    // function getMissingPerson(uint _id) public view returns (uint, string memory, uint, uint, Status, string memory, string memory, string memory) {
    //     return (_id, missingPeople[_id].name, missingPeople[_id].age, missingPeople[_id].height, missingPeople[_id].status, missingPeople[_id].description, missingPeople[_id].division, missingPeople[_id].relative);
    // }


//    event votedEvent( uint indexed _candidateId );
//    // model a candidate
//    struct Candidate {
//        uint id;
//        string name;
//        uint voteCount;
//    }
//    // Store accounts that have voted
//    mapping( address => bool ) public voters;


//    // Read/write candidates
//    mapping( uint => Candidate ) public candidates;


//    // store candidates count
//    uint public candidatesCount;


//    // Constructor
//    constructor() {
//        addCandidate( "Candidate 1" );
//        addCandidate( "Candidate 2" );
//    }


//    // adding candidates
//    function addCandidate( string memory _name ) private {
//        candidatesCount++;
//        candidates[ candidatesCount ] = Candidate( candidatesCount, _name, 0 );
//    }


//    // cast vote
//    function vote( uint _candidateId ) public {
//        // require that the current voter haven't voted before
//        require( !voters[ msg.sender ]);


//        // candidate should be valid
//        require( _candidateId > 0 && _candidateId <= candidatesCount );


//        // record voters vote
//        voters[ msg.sender ] = true;


//        // update candidates vote count
//        candidates[ _candidateId ].voteCount++;
//        emit votedEvent( _candidateId );
//               }
}