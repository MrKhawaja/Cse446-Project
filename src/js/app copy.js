App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
  lastId: -1,

  init: function() {
    return App.initWeb();
  },
 
 
  initWeb:function() {
    // if an ethereum provider instance is already provided by metamask
    const provider = window.ethereum
    if( provider ){
      // currently window.web3.currentProvider is deprecated for known security issues.
      // Therefore it is recommended to use window.ethereum instance instead
      App.webProvider = provider;
    }
    else{
      $("#loader-msg").html('No metamask ethereum provider found')
      console.log('No Ethereum provider')
      // specify default instance if no web3 instance provided
      App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    return App.initContract();
  },
 
 
  initContract: function() {


    $.getJSON("MissingDiaries.json", function( missingDiaries ){
      // instantiate a new truffle contract from the artifict
      App.contracts.MissingDiaries = TruffleContract( missingDiaries );
 
 
      // connect provider to interact with contract
      App.contracts.MissingDiaries.setProvider( App.webProvider );
 
      
      return App.render();
       
    })
 
 
  },
 
 
 
  render: async function(){
    let missingDiariesInstance;
    const loader = $("#loader");
    const content = $("#content");
    var admin = '0x730df5253905e4d3e39d8ff3272e69ce2975be36';
 
 
    loader.show();
    content.hide();
   
    // load account data
    if (window.ethereum) {
      try {
        // recommended approach to requesting user to connect mmetamask instead of directly getting the accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts;
        $("#accountAddress").html("Your Account: " + App.account);
        console.log(App.account)
        if (App.account[0] === admin) {
          $("#missingRes").show();
          $("#addPeopleForm").hide();
          $("#divisionD").hide();
          $("#divisionRes").hide();
        }
        else {
          $("#admin").hide();
          $("#adminU").hide();
          $("#missing").hide();
      }
    } catch (error) {
        if (error.code === 4001) {
          // User rejected request
          console.warn('user rejected')
        }
        $("#accountAddress").html("Your Account: Not Connected");
        console.error(error);
      }
    }

    App.contracts.MissingDiaries.deployed()
    .then( function( instance ){
      missingDiariesInstance = instance;
      return missingDiariesInstance.missingPeopleCount();
    }).then( function( missingPeopleCount ){
      var missingPeopleResults = $("#missingPeopleResults");
      for( let i = 1; i <= missingPeopleCount; i++ ){
        missingDiariesInstance.missingPeople(i)
        .then( function( person ){
          let id = person[0];
          if (id > App.lastId) {
            App.lastId = id;}
          let name = person[1];
          let age = person[2];
          let height = person[3];
          let status = person[4].c[0] === 0 ? "Missing" : "Found";
          let description = person[5];
          let division = person[6];
          let relative = person[7];
          let missingPeopleTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + relative + "</td></tr>";
          $("#missingPeopleResults").append(missingPeopleTemplate);
        })
      }}).then( function(){
        loader.hide();
        content.show();
        App.listenForEvents();
      }).catch( function( error ){ 
        console.warn( error )
      })


 
  },
 
  addPerson: function(){
    let name = $("#name").val();
    let age = $("#age").val();
    let height = $("#height").val();
    let status = 0;
    let description = $("#description").val();
    let division = $("#division").val();
    let relative = $("#relative").val();
    console.log(name, age, height, status, description, division, relative)
    App.contracts.MissingDiaries.deployed()
    .then( function( instance ){
      return instance.addMissingPerson(name, age, height, status, description, division, relative, {from: App.account[0]})
    }).catch( function( error ){
      console.warn( error )
    });
  },

  changeStatus: function(){
    let id = $("#id").val();
    let idCheck = parseInt(id);
    console.log('called')
    App.contracts.MissingDiaries.deployed()
    .then(function(instance){
      console.log(idCheck)
      return instance.foundPerson(idCheck, {from: App.account[0]})
    })
  },

  searchPerson: function(){
    // let division = $("#division").val();
    let divisionToSearch = $("#filter").val(); // Specify the division to search
    App.contracts.MissingDiaries.deployed()
      .then(function(instance){
        personInstance = instance;
        instance.missingPeopleCount()
        .then(function(count){
          var searchResult = $("#searchResult")
          searchResult.empty();
          for (let i = 1; i <= count; i++) {
            personInstance.missingPeople(i).then(
              function(person){
                let division = person[6];
                // Check if the division matches the one to search
                if (division === divisionToSearch) {
                  let id = person[0];
                  let name = person[1];
                  let age = person[2];
                  let height = person[3];
                  let status = person[4].c[0] === 0 ? "Missing" : "Found";
                  let description = person[5];
                  let division = person[6];
                  let relative = person[7];
                  let missingPeopleT = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + relative + "</td></tr>";
                  searchResult.append(missingPeopleT);
              }
            }
            )
          }
        })
      })
      .catch(function(error){
        console.error('Error searching for missing persons:', error);
      });
  },


  getMissingCounts: function(){
    App.contracts.MissingDiaries.deployed()
    .then( function( instance ){
      
      let divisions = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];
      let data = []
      instance.getCount().then(
        function(result){
          var divisionCount = $("#divisionCount")
          divisionCount.empty();
          for (let i = 0; i < divisions.length; i++) {
            data.push({division:divisions[i],count: result[i].c[0]});
          }
          data.sort(function(a, b){return b.count - a.count});
          data.forEach(function(item){
            let division = item.division;
            let count = item.count;
            let missingPeopleT = "<tr><th>" + division + "</th><td>" + count + "</td></tr>";
            divisionCount.append(missingPeopleT);
          })
          data = data.filter(function(item){
            return item.count >0;
          })
          const n = data.length;
          if (n%2==0){
            var median = (data[n/2].count + data[(n/2)-1].count)/2;
          }else{
            var median = data[Math.floor(n/2)].count;
          }
          $("#median").html("Median: " + median);

        }
      
      )
      
        
    })
    .catch( function( error ){
        console.log( error )})
  },
  
  // voted event
 listenForEvents: function(){
  App.contracts.MissingDiaries.deployed()
  .then( function( instance ){
    instance.missingPersonAdded(
      {},
      {
        fromBlock: 0,
        toBlock: 'latest'
      }
    ).watch( function( error, event ){
      let missingPeopleResults = $("#missingPeopleResults");
      let id = event.args._missingPersonId.c[0];
      if (id > App.lastId) {
      App.lastId = id;
      let name = event.args._name;
      let age = event.args._age.c[0];
      let height = event.args._height.c[0];
      let status = event.args._status.c[0] === 0? "Missing" : "Found";
      let description = event.args._description;
      let division = event.args._division;
      let relative = event.args._relative;
      let missingPeopleTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + relative + "</td></tr>";
      missingPeopleResults.append(missingPeopleTemplate);}
    }
    )

    let statusToSearch = 'Missing';
    App.contracts.MissingDiaries.deployed()
      .then(function(instance){
        personInstance = instance;
        instance.missingPeopleCount()
        .then(function(count){
          let missingResults = $("#missingRes")
          missingResults.empty();
          for (let i = 1; i <= count; i++) {
            personInstance.missingPeople(i).then(
              function(person){
                let status = person[4].c[0] === 0 ? "Missing" : "Found";
                // Check if the division matches the one to search
                if (status === statusToSearch) {
                  let id = person[0];
                  let name = person[1];
                  let age = person[2];
                  let height = person[3];
                  let status = person[4].c[0] === 0 ? "Missing" : "Found";
                  let description = person[5];
                  let division = person[6];
                  let relative = person[7];
                  let missingPeopleT = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + relative + "</td></tr>";
                  missingResults.append(missingPeopleT);
          }
        });
      }})
  })
  .catch(function(error){
    console.error('Error searching for missing persons:', error);
  });
})
 }
 
};

 $(function() {
  $(window).load(function() {
    App.init();
  });
 });