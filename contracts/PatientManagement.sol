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

    mapping(uint => address) public addresses;

    mapping(string => uint) public districtCount;

    mapping(uint => string) public districts;

    uint public userCount;
    uint public deployDate;
    uint public districtIndex;

    event deathRateUpdated(uint count);

    constructor() {
        deployDate = block.timestamp;
        address res = 0x525a60a28d163Dd81Cb39aA2B4E4d8189090e4ae;
        addresses[userCount] = res;
        user[res] = User(0,5,"male",Status.two_dose,"Dhaka","sdfsdf",false,true);
        districtCount["Dhaka"] = 1;
        districts[0] = "Dhaka";
        districtIndex += 1;
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
        addresses[userCount] = msg.sender;
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
        if(districtCount[_district] == 0){
            districtCount[_district] = 1;
            districts[districtIndex] = _district;
            districtIndex += 1;
        }else{
            districtCount[_district] += 1;
        }
    }

    function checkAdmin() public view returns (bool){
        return user[msg.sender].is_admin;
    }

    function updateUser(address _address, Status _vaccine_status, bool _is_dead) public {
        if(user[msg.sender].is_admin){
            user[_address].vaccine_status = _vaccine_status;
            user[_address].is_dead = _is_dead;
            uint count = getDeathRate();
            emit deathRateUpdated(count);
        }
    }

    function getDeathRate() public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i <= userCount; i++) {
            address res = addresses[i];
            if(user[res].is_dead){
                count += 1;
            }
        }
        count = (count/(((block.timestamp-deployDate) / 1 days)+1));
        return count;
    }

    function getHighestPatient() public view returns (string memory){
        uint max = 0;
        string memory district = "";
        for (uint i = 0; i < districtIndex; i++) {
            if(districtCount[districts[i]] > max){
                max = districtCount[districts[i]];
                district = districts[i];
            }
        }
        return district;
    }
    
    function getDistricts() public view returns (string[] memory){
        string[] memory districtList = new string[](districtIndex+1);
        for (uint i = 0; i <= districtIndex; i++) {
            districtList[i] = districts[i];
        }
        return districtList;
    }

    function getAllMedianAge() public view returns (uint[] memory){
        uint[] memory medianAges = new uint[](districtIndex+1);
        for (uint i = 1; i <= districtIndex; i++) {
            medianAges[i] = getMedianAge(districts[i-1]);
        }
        return medianAges;
    }

    function getMedianAge(string memory district) public view returns(uint){
        uint[] memory patients = new uint[](districtCount[district]);
        uint count = 0;
        for (uint i = 0; i <= userCount; i++) {
            address res = addresses[i];
            if(keccak256(abi.encodePacked(user[res].district)) == keccak256(abi.encodePacked(district))){
                patients[count] = user[res].age;
                count += 1;
            }
        }
        for (uint i = 0; i < count - 1; i++) {
            for (uint j = 0; j < count - i - 1; j++) {
                if (patients[j] > patients[j + 1]) {
                    (patients[j], patients[j + 1]) = (patients[j + 1], patients[j]);
                }
            }
        }

        if(count % 2 == 0){
            return (patients[(count/2)-1] + patients[(count/2)])/2;
        }else{
            return patients[((count+1)/2)-1];
        }
    }

    function getCategoryPercentage() public view returns(uint[] memory){
        uint[] memory category = new uint[](5);
        for (uint i = 0; i <= userCount; i++) {
            address res = addresses[i];
            if(user[res].age < 13){
                category[1] += 1;
            }else if(user[res].age >= 13 && user[res].age < 20){
                category[2] += 1;
            }else if(user[res].age >= 20 && user[res].age < 50){
                category[3] += 1;
            }else{
                category[4] += 1;
            }
        }
        
        for (uint i = 1; i < 5; i++) {
            category[i] = (category[i]/(userCount+1))*100;
        }
        return category;
    }

    function getEligibleForCertificate() public view returns(bool){
        if(user[msg.sender].vaccine_status == Status.two_dose){
            return true;
        }else{
            return false;
        }
    }


}
