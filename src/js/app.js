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


    $.getJSON("PatientManagement.json", function( patientManagement ){
      // instantiate a new truffle contract from the artifict
      App.contracts.PatientManagement = TruffleContract( patientManagement );
 
 
      // connect provider to interact with contract
      App.contracts.PatientManagement.setProvider( App.webProvider );
 
      
      return App.render();
       
    })
 
 
  },
 
 
 
  render: async function(){
    let patientManagementInstance;
    const loader = $("#loader");
    const content = $("#content");
 
 
    loader.show();
    content.hide();
    $("#updateUserForm").hide();
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

    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
      return instance.checkAdmin({from: App.account[0]});
    }).then( function( is_admin ){
      if(is_admin){
        $("#updateUserForm").show();
      }
    }).then( function(){
      loader.hide();
      content.show();
      App.listenForEvents();
    }).catch( function( error ){ 
      console.warn( error )
    })

    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
      return instance.getDeathRate();
    }).then( function( rate ){
      $("#death-rate").html(rate.c[0]);
    }).then( function(){
      loader.hide();
      content.show();
    }).catch( function( error ){ 
      console.warn( error )
    })

    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
      return instance.getHighestPatient();
    }).then( function( district ){
      $("#death-district").html(district);
    }).then( function(){
      loader.hide();
      content.show();
    }).catch( function( error ){ 
      console.warn( error )
    })

    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
       patientManagementInstance = instance;
      return instance.getDistricts();
    }).then( function( districts){
      districts.shift();
      districts.forEach(function(district){
        $("#districts").append("<th>" + district + "</th>");
      })
      return patientManagementInstance.getAllMedianAge();
    }).then(function(medians){
      medians.shift();
      medians.forEach(function(median){
        $("#medians").append("<td>" + median.c[0] + "</td>");
      })
    }).then( function(){
      loader.hide();
      content.show();
    }).catch( function( error ){ 
      console.warn( error )
    })

    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
      patientManagementInstance = instance;
      return instance.getCategoryPercentage();
    }).then( function( category ){
      category.shift();
      category.forEach(function(cat){
        $("#category").append("<td>" + cat + "</td>");
      })
      return patientManagementInstance.getEligibleForCertificate({from: App.account[0]});
    }).then(function(o){
      console.log(o)
      if(o){
        $("#get-cert").html('<button class="btn btn-primary" onclick="App.downloadCert(); return false">Get Certificate</button>');}
    }).then( function(){
      loader.hide();
      content.show();
    }).catch( function( error ){ 
      console.warn( error )
    })
 
  },
  downloadCert: function(){
    $("#content").html("<h1>THIS IS YOUR CERTIFICATE</h1><h1>THIS IS YOUR CERTIFICATE</h1><h1>THIS IS YOUR CERTIFICATE</h1><h1>THIS IS YOUR CERTIFICATE</h1>")
  },
  addUser: function(){
    let gender = $("#gender").val();
    let age = $("#age").val();
    let vaccine_status = $("#vaccine_status").val();
    let symptoms_details = $("#symptoms_details").val();
    let district = $("#district").val();
    let is_dead = $("#is_dead").val();
    vaccine_status = parseInt(vaccine_status);
    console.log(gender, age , vaccine_status, symptoms_details, district, is_dead)
    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
      return instance.addUser(age, gender, vaccine_status, district, symptoms_details, is_dead == "true", {from: App.account[0]})
    }).catch( function( error ){
      console.warn( error )
    });
  },

  updateUser: function(){
    let vaccine_status = $("#uvaccine_status").val();
    let address = $("#uaddress").val();
    let is_dead = $("#uis_dead").val();
    App.contracts.PatientManagement.deployed()
    .then( function( instance ){
      return instance.updateUser(address, vaccine_status, is_dead == "true", {from: App.account[0]})
    }).catch( function( error ){
      console.warn( error )
    });

  },

  
 listenForEvents: function(){
  App.contracts.PatientManagement.deployed()
  .then( function( instance ){
    instance.deathRateUpdated(
      {},
      {
        fromBlock: 0,
        toBlock: 'latest'
      }
    ).watch( function( error, event ){
      if( !error ){
        $("#death-rate").html(event.args.count.c[0]);
        console.log('Death rate updated')
      }
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