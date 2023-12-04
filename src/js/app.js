App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
  admin: '0xD907c577f266D30bad083D2AD241184c0C2481c5',
 
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
 
      App.listenForEvents();

      return App.render();
    })
 
 
  },
 
 
 
  render: async function(){
    let missingDiariesInstance;
    const loader = $("#loader");
    const content = $("#content");
 
 
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
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
          console.warn('user rejected')
        }
        $("#accountAddress").html("Your Account: Not Connected");
        console.error(error);
      }
    }
 
 
    //load contract ddata
    // App.contracts.MissingDiaries.deployed()
    // .then( function( instance ){
    //   missingDiariesInstance = instance
      
    //   return missingDiariesInstance.missingPeopleCount();
    // }).then( function(missingPeopleCount){
    //     let missingPeopleResults = $("#missingPeopleResults");
    //     missingPeopleResults.empty();
    //     for (let i = 1; i <= missingPeopleCount.c[0]; i++) {
    //       missingDiariesInstance.missingPeople(i).then(
    //         function(people){
    //           let id = people[0];
    //           let name = people[1];
    //           let age = people[2];
    //           let height = people[3];
    //           let status = people[4].c[0] === 0? "Missing" : "Found";
    //           let description = people[5];
    //           let division = people[6];
    //           let relative = people[7];
    //           // render missing people result
    //           let missingPeopleTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + relative + "</td></tr>";
    //           missingPeopleResults.append(missingPeopleTemplate);
    //         }
    //       )
    //     }
    //   loader.hide();
    //   content.show();
    // }) 
    // .catch( function( error ){
    //   console.warn( error )
    // });
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
                  let status = person[4] === 0 ? "Missing" : "Found";
                  let description = person[5];
                  let relative = person[6];
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
      let name = event.args._name;
      let age = event.args._age.c[0];
      let height = event.args._height.c[0];
      let status = event.args._status.c[0] === 0? "Missing" : "Found";
      let description = event.args._description;
      let division = event.args._division;
      let relative = event.args._relative;
      let missingPeopleTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + relative + "</td></tr>";
      missingPeopleResults.append(missingPeopleTemplate);
    }
    )

    
  })
}

 
 };
 
 
 $(function() {
  $(window).load(function() {
    App.init();
  });
 });
 