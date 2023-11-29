App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
 
 
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
    App.contracts.MissingDiaries.deployed()
    .then( function( instance ){
      missingDiariesInstance = instance;
      return missingDiariesInstance.getMissingPersons();
    }).then( function(instance){
        console.log(instance)
      }) 
    .catch( function( error ){
      console.warn( error )
    });
  },
 
  addPerson: function(){
    let name = $("#name").val();
    let age = $("#age").val();
    let height = $("#height").val();
    let status = $("#status").val();
    let description = $("#description").val();
    let division = $("#division").val();
    let relative = $("#relative").val();
  },
  // voted event
//  listenForEvents: function(){
//   App.contracts.MissingDiaries.deployed()
//   .then( function( instance ){
//     instance.votedEvent({}, {
//       fromBlock: 0,
//       toBlock: "latests"
//     })
//     .watch( function( err, event ){
//       console.log("Triggered", event);
//       // reload page
//       App.render()
//     })
//   })
// }

 
 };
 
 
 $(function() {
  $(window).load(function() {
    App.init();
  });
 });
 