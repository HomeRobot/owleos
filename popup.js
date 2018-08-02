
document.addEventListener('DOMContentLoaded', function() {
	let Eoswallet = new owlEosWallet(getNode(), '');
    let loginButton = id('login');
	let regButton = id('register');
	let tab1 = id('tab1');
	let tab2 = id('tab2');
	let tab3 = id('tab3');
	let tab4 = id('tab4');
	let transferButton = id('transfer_btn');
	let stakeButton = id('stake_btn');
	let unstakeButton = id('unstake_btn');
	let createButton = id('create_btn');
	let buyButton = id('buy_btn');
	let sellButton = id('sell_btn');
	let saveButton = id('save_btn');
	let donate = id('donate');
	let walletnew = id('walletnew');
	let delLink = id('delete');
	
	let actionSelect = id('action');
	id('message').style.display = 'none';
	id('message').value = '';	
	id('description').value = '';
	
	let options = loadSettings();
	loadAccounts();
	
	if(accounts.length == 0) {
		id('reg').style.display = 'block';
		id('login_div').style.display = 'none';
	}
	else {
		id('reg').style.display = 'none';
		id('login_div').style.display = 'block';
	}
	
	tab1.addEventListener('click', function(event) {
		openTab(event, 'history');
		def = JSON.parse(localStorage.getItem(getWallet()));
		updateHistory(def.account);
	});
	tab2.addEventListener('click', function(event) {
		openTab(event, 'actions');
		
	});
	tab3.addEventListener('click', function(event) {
		openTab(event, 'settings');
	});
	tab4.addEventListener('click', function(event) {
		openTab(event, 'more');
	});
	
	actionSelect.addEventListener('change', function(event) {
		let actions = document.getElementsByClassName("action");
		getRamPrice();
		for (i = 0; i < actions.length; i++) {
			actions[i].style.display = "none";
		}
		if(id(actionSelect.value)) {
			id(actionSelect.value).style.display = "block";
			let pass_id = actionSelect.value + '_pass';
			if(sessionStorage.getItem("pass")) {
				id(pass_id).style.display = "none";
			}
			else {
				id(pass_id).style.display = "inline";
			} 				
		}		
	});
	
	saveButton.addEventListener('click', function() {
		saveSettings();
		message('Settings are saved.');
	});
	
	donate.addEventListener('click', function() {
		message('Donate please');
		tab2.click();
		id('action').value = 'transfer';
		id('transfer_acc').value= 'owleoswallet';
		id('transfer_eos').value = '5.0000';
		id('transfer_memo').value = 'Donate';
	});
	
	walletnew.addEventListener('click', function() {
		id('reg').style.display = 'block';
		id('login_div').style.display = 'none';
	});
	
	delLink.addEventListener('click', function() {
		if(confirm('Are you sure? All the local data will be deleted.')) {
			let current = getWallet();
			localStorage.removeItem(current);
			let pos = accounts.indexOf(current);
			accounts.splice(pos, 1);
			localStorage.setItem('accounts', JSON.stringify(accounts))
			window.close();
		}
	});
	
	/******************* Transfer EOS **************/
	transferButton.addEventListener('click', function() {
		if(!sessionStorage.getItem("pass")){
			if(id(actionSelect.value)) {
				let pass_id = actionSelect.value + '_pass';
				sessionStorage.setItem("pass", id(pass_id).value);
				id(pass_id).value = '';
			}
		}
		let pass = sessionStorage.getItem("pass");
		if(!pass)
		{
			message("Invalid password");
			return;
		}
		let acc = id('transfer_acc').value;
		if(acc == '')
		{
			message("Invalid account");
			return;
		}
		let eos = parseFloat(id('transfer_eos').value);
		if(!eos)
		{
			message("Invalid amount");
			return;
		}	
		let memo = id('transfer_memo').value;
		let key = sjcl.decrypt(pass, JSON.parse(localStorage.getItem(getWallet())).key);
		let config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: getNode(),
		}
		key = '';
		let me = JSON.parse(localStorage.getItem(getWallet())).account;
		let owl = Eos(config);
		let options = {
		  authorization: me+'@active',
		  broadcast: true,
		  sign: true
		}
		console.log('transfer', me, acc, eos, memo);
		let promise = owl.transfer(me, acc, number_format(eos, 4, '.', '') + ' EOS', memo, options);
		promise.then((data) => {
		  message("Success! Transfer done.");
		}, (error) => {
			err = JSON.parse(error);
			console.log(err);
			message('Error: ' + err.error.details[0].message);
		});
		config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [''], 
			httpEndpoint: getNode(),
		}
		owl = Eos(config);
		id('transfer_memo').value = '';
		id('transfer_acc').value = '';
		id('transfer_eos').value = '';		
		updateAccount(me);
		id('description').innerHTML = '';
	});
	
	/******************* Stake EOS **************/
	stakeButton.addEventListener('click', function() {
		if(!sessionStorage.getItem("pass")){
			if(id(actionSelect.value)) {
				let pass_id = actionSelect.value + '_pass';
				sessionStorage.setItem("pass", id(pass_id).value);
				id(pass_id).value = '';
			}
		}
		let pass = sessionStorage.getItem("pass");
		if(!pass) {
			message("Invalid password");
			return;
		}
		let net_quantity = parseFloat(id('stake_net_quantity').value);
		net_quantity = id('stake_net_quantity').value;
		if(!net_quantity) {
			net_quantity = 0;
		}	
		let cpu_quantity = parseFloat(id('stake_cpu_quantity').value);
		cpu_quantity = id('stake_cpu_quantity').value;
		if(!cpu_quantity) {
			cpu_quantity = 0;
		}
		if(net_quantity <= 0 && cpu_quantity <= 0) {
			message("Set value > 0 for CPU or NET");
			return;
		}		
		let key = sjcl.decrypt(pass, JSON.parse(localStorage.getItem(getWallet())).key);
		let config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: getNode(),
		}
		key = '';
		let me = JSON.parse(localStorage.getItem(getWallet())).account;
		let acc = id('stake_acc').value.trim();
		if(acc == '') {
			acc = me;
		}
		let owl = Eos(config);
		let options = {
		  authorization: me+'@active',
		  broadcast: true,
		  sign: true
		}
		console.log('delegatebw', me, acc, net_quantity, cpu_quantity);		
		let promise = owl.delegatebw({
			from: me,
			receiver: acc,
			stake_net_quantity: number_format(net_quantity, 4, '.', '') + ' EOS',
			stake_cpu_quantity: number_format(cpu_quantity, 4, '.', '') + ' EOS',
			transfer: 0
			}, options);
		promise.then((data) => {
			message("Success! EOS staked.");
		}, (error) => {
			err = JSON.parse(error);
			console.log(err);
			message('Error: ' + err.error.details[0].message);
		});			
		config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [''], 
			httpEndpoint: getNode(),
		}
		owl = Eos(config);
		id('stake_net_quantity').value = '';
		id('stake_cpu_quantity').value = '';
		id('transfer_acc').value = '';
		
		updateAccount(me);
		id('description').innerHTML = '';		
	});	

	/******************* Unstake EOS **************/
	unstakeButton.addEventListener('click', function() {
		if(!sessionStorage.getItem("pass")){
			if(id(actionSelect.value)) {
				let pass_id = actionSelect.value + '_pass';
				sessionStorage.setItem("pass", id(pass_id).value);
				id(pass_id).value = '';
			}
		}
		let pass = sessionStorage.getItem("pass");
		if(!pass) {
			message("Invalid password");
			return;
		}
		let net_quantity = parseFloat(id('unstake_net_quantity').value);
		net_quantity = id('unstake_net_quantity').value;
		if(!net_quantity) {
			net_quantity = 0;
		}	
		let cpu_quantity = parseFloat(id('unstake_cpu_quantity').value);
		cpu_quantity = id('unstake_cpu_quantity').value;
		if(!cpu_quantity) {
			cpu_quantity = 0;
		}
		if(net_quantity <= 0 && cpu_quantity <= 0) {
			message("Set value > 0 for CPU or NET");
			return;
		}		
		let key = sjcl.decrypt(pass, JSON.parse(localStorage.getItem(getWallet())).key);
		let config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: getNode(),
		}
		key = '';
		let me = JSON.parse(localStorage.getItem(getWallet())).account;
		let owl = Eos(config);
		let options = {
		  authorization: me+'@active',
		  broadcast: true,
		  sign: true
		}
		console.log('undelegatebw', me, net_quantity, cpu_quantity);		
		let promise = owl.undelegatebw({
			from: me,
			receiver: me,
			unstake_net_quantity: number_format(net_quantity, 4, '.', '') + ' EOS',
			unstake_cpu_quantity: number_format(cpu_quantity, 4, '.', '') + ' EOS'
			}, options);
		promise.then((data) => {
			message("Success! EOS unstaked.");
		}, (error) => {
			err = JSON.parse(error);
			console.log(err);
			message('Error: ' + err.error.details[0].message);
		});	
		config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [''], 
			httpEndpoint: getNode(),
		}
		owl = Eos(config);
		id('unstake_net_quantity').value = '';
		id('unstake_cpu_quantity').value = '';		
		updateAccount(me);
		id('description').innerHTML = '';		
	});	
	
	/******************* Create account **************/
	createButton.addEventListener('click', function() {
		id('message').value = '';
		if(!sessionStorage.getItem("pass")){
			if(id(actionSelect.value)) {
				let pass_id = actionSelect.value + '_pass';
				sessionStorage.setItem("pass", id(pass_id).value);
				id(pass_id).value = '';
			}
		}
		let pass = sessionStorage.getItem("pass");
		if(!pass) {
			message("Invalid password");
			return;
		}
		if(!id('create_acc').checkValidity()) {
			message(id('create_acc').validationMessage);
			id('create_acc').value = '';
			return;
		}
		let acc = id('create_acc').value;
		if(!eosjs_ecc.isValidPublic(id('create_key').value)){
			message('Invalid public key');
			id('create_key').value = '';
			return;
		}
		let pubkey = id('create_key').value;
		let ram = parseFloat(id('create_ram').value);
		if(ram < 3)
		{
			message('You should buy 3 or more Kb of RAM');
			return;
		}
		ram = ram * 1024;
		let key = sjcl.decrypt(pass, JSON.parse(localStorage.getItem(getWallet())).key);
		let config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: getNode(),
		}
		key = '';
		let me = JSON.parse(localStorage.getItem(getWallet())).account;
		
		let owl = Eos(config);
		owl.getAccount(acc).then(account => {
			if(account){
				message('The account already exists');
				return;
			}
		})			
		console.log('create', me, acc, pubkey, ram);		
		let promise = owl.transaction(tr => {
			tr.newaccount({
				creator: me,
				name: acc,
				owner: pubkey,
				active: pubkey
			  }) 
			  
			  tr.buyrambytes({
				payer: me,
				receiver: acc,
				bytes: ram
			  })
		})	
		promise.then((data) => {
			message("Success! Account "+acc+" created.");
		}, (error) => {
			err = JSON.parse(error);
			console.log(err);
			message('Error: ' + err.error.details[0].message);
		});	
		config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [''], 
			httpEndpoint: getNode(),
		}
		owl = Eos(config);
		id('create_key').value = '';
		id('create_acc').value = '';
		id('create_ram').value = '';
		
		updateAccount(me);
		id('description').innerHTML = '';
	});
	
	/******************* Buy RAM **************/
	buyButton.addEventListener('click', function() {
		id('message').value = '';
		if(!sessionStorage.getItem("pass")){
			if(id(actionSelect.value)) {
				let pass_id = actionSelect.value + '_pass';
				sessionStorage.setItem("pass", id(pass_id).value);
				id(pass_id).value = '';
			}
		}
		let pass = sessionStorage.getItem("pass");
		if(!pass) {
			message("Invalid password");
			return;
		}
		let ram = parseFloat(id('buy_ram').value);
		ram = ram * 1024;
		let key = sjcl.decrypt(pass, JSON.parse(localStorage.getItem(getWallet())).key);
		let config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: getNode(),
		}
		key = '';
		let me = JSON.parse(localStorage.getItem(getWallet())).account;
		let acc = id('buy_acc').value.trim();
		if(acc == '') {
			acc = me;
		}
		let owl = Eos(config);
		console.log('buy ram', me, acc, ram);		
		let promise = owl.transaction(tr => {
			  tr.buyrambytes({
				payer: me,
				receiver: acc,
				bytes: ram
			  })
		})	
		promise.then((data) => {
			message("Success! Bought "+ram+" Kb RAM.");
		}, (error) => {
			err = JSON.parse(error);
			console.log(err);
			message('Error: ' + err.error.details[0].message);
		});
		config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [''], 
			httpEndpoint: getNode(),
		}
		owl = Eos(config);
		id('create_key').value = '';
		id('create_acc').value = '';
		id('create_ram').value = '';
		
		updateAccount(me);
		id('description').innerHTML = '';
	});
	
	/******************* Sell RAM **************/
	sellButton.addEventListener('click', function() {
		id('message').value = '';
		if(!sessionStorage.getItem("pass")){
			if(id(actionSelect.value)) {
				let pass_id = actionSelect.value + '_pass';
				sessionStorage.setItem("pass", id(pass_id).value);
				id(pass_id).value = '';
			}
		}
		let pass = sessionStorage.getItem("pass");
		if(!pass) {
			message("Invalid password");
			return;
		}
		let ram = parseFloat(id('sell_ram').value);
		ram = ram * 1024;
		let key = sjcl.decrypt(pass, JSON.parse(localStorage.getItem(getWallet())).key);
		let config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: getNode(),
		}
		key = '';
		let me = JSON.parse(localStorage.getItem(getWallet())).account;
		let owl = Eos(config);
		console.log('sell ram', me,  ram);		
		let promise = owl.transaction(tr => {
			  tr.sellram({
				account: me,
				bytes: ram
			  })
		})	
		promise.then((data) => {
			message("Success! Sold "+ram+" Kb RAM.");
		}, (error) => {
			err = JSON.parse(error);
			console.log(err);
			message('Error: ' + err.error.details[0].message);
		});
		config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [''], 
			httpEndpoint: getNode(),
		}
		owl = Eos(config);
		id('sell_ram').value = '';
		
		updateAccount(me);
		id('description').innerHTML = '';
	});
	
    loginButton.addEventListener('click', function() {	
		id('message').style.display = 'none';
		
		id('message').value = '';
		wallet = id('user').value;
		let def;
		def = JSON.parse(localStorage.getItem(wallet));
		id('username').innerHTML = def.account;
		id('login_div').style.display = 'none';
		id('logo').style.display = 'none';
		id('hello').style.display = 'block';
		id('balance').style.display = 'block';
		id('tabs').style.display = 'block';
		id('tab1').click();
		
		updateAccount(def.account);			
		
    }, false);
		
	regButton.addEventListener('click', function() { 
		document.getElementById('message').value = '';
		let pass1 = id('pass1').value;
		let pass2 = id('pass2').value;
		let key = id('key').value;
		if(pass1 != pass2 || !pass1 || !pass2) {
			message('Passwords mismatch or empty');
			return;
		}
		if(!key) {
			message('Key is empty');
			return;
		}

		
		if(!eosjs_ecc.isValidPrivate(key))
		{
			message('Key is invalid');
			return;
		}
		//check key 
		let def = new Object();
		let public_key = eosjs_ecc.privateToPublic(key);
		if(!public_key)
		{
			message('Key is invalid');
			return;
		}
		Eoswallet.eos.getKeyAccounts(public_key).then(val => {
			if(val.account_names.length > 0)
			{
				if(accounts.indexOf(val.account_names[0]) >= 0)
				{
					message('Wallet already exists');
					return;
				}
				def.account = val.account_names[0];
				def.key = sjcl.encrypt(pass1, key);
				def.public_key = public_key;
				accounts.push(def.account);
				localStorage.setItem('accounts', JSON.stringify(accounts));
				localStorage.setItem(def.account, JSON.stringify(def));
				//clear passwords
				pass1 = '';
				pass2 = '';
				//show login
				id('reg').style.display = 'none';
				id('login_div').style.display = 'block';
				loadAccounts();
			}
			else
			{
				message('There is no any account associated with the key...');
				id('reg').style.display = 'block';
				id('login_div').style.display = 'none';
				return;
			}
			 
		});
	 }, false);
}, false);

function message(txt) {
	id('message').style.display = 'block';
	id('message').value = txt;
}

function id(an_id) {
	return document.getElementById(an_id);
}

function getLang() {
	if (navigator.languages != undefined) 
		return navigator.languages[0]; 
	else 
		return navigator.language;
}

function openTab(evt, tabName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    id(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function clearTable(table) {
	let elmtTable = id(table);
	let tableRows = elmtTable.getElementsByTagName('tr');
	let rowCount = tableRows.length;

	for (let x = rowCount - 1; x >= 0; x--) {
	   elmtTable.deleteRow(tableRows[x]);
	}
	let row = elmtTable.insertRow(-1);
	let cell1 = row.insertCell(0);
	let cell2 = row.insertCell(1);
	let cell3 = row.insertCell(2);
	cell1.innerHTML = 'Time';
	cell2.innerHTML = 'Action';
	cell3.innerHTML = 'Details';
}

function addRow(table, c1, c2, c3, color){
	let t = id(table);
	let row = t.insertRow(-1);
	let cell1 = row.insertCell(0);
	let cell2 = row.insertCell(1);
	let cell3 = row.insertCell(2);
	cell1.innerHTML = c1;
	cell1.style = 'font-size: 80%';
	cell2.innerHTML = c2;
	cell2.style = 'text-align:center; font-size: 80%; background: '+color+'; border-radius: 3px;';
	cell3.innerHTML = c3;
}

function circle(div_id, val, max, c1, c2) {
	let myCircle = Circles.create({
	  id:                  div_id,
	  radius:              35,
	  value:               val,
	  maxValue:            max,
	  width:               10,
	  text:                function(value){return value + '%';},
	  colors:              [c1, c2],
	  duration:            400,
	  wrpClass:            'circles-wrp',
	  textClass:           'circles-text',
	  valueStrokeClass:    'circles-valueStroke',
	  maxValueStrokeClass: 'circles-maxValueStroke',
	  styleWrapper:        true,
	  styleText:           true
	});
}

function getRate(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://api.coinmarketcap.com/v1/ticker/eos/', true);
	xhr.send();
	xhr.onreadystatechange = function() {
	  if (xhr.readyState != 4) return;
	  if (xhr.status != 200) {
		console.log(xhr.status + ': ' + xhr.statusText);
	  } else {
		eos_rate = JSON.parse(xhr.responseText);
	  }
	}
}

function getRamPrice(){
	
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://api.eosnewyork.io' + ':/v1/chain/get_table_rows', true);//getNode()
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify({"json":"true", "code":"eosio", "scope":"eosio", "table":"rammarket", "limit":"10"}));
	xhr.onreadystatechange = function() {
	  if (xhr.readyState != 4) return;
	  if (xhr.status != 200) {
		console.log(xhr.status + ': ' + xhr.statusText);
	  } else {
		//let maxRam = 64;
		let result = JSON.parse(xhr.responseText).rows[0];
		console.log(result);
		let ramBaseBalance = result.base.balance;
		ramBaseBalance = ramBaseBalance.substr(0,ramBaseBalance.indexOf(' '));
		let ramQuoteBalance = result.quote.balance;
		ramQuoteBalance = ramQuoteBalance.substr(0,ramQuoteBalance.indexOf(' '));
		//let ramUsed = 1-(ramBaseBalance-maxRam);
		//console.log(ramBaseBalance, ramQuoteBalance, ramUsed);
		ram_price = (ramQuoteBalance/ramBaseBalance).toFixed(4)*1024;
	  }
	}
}

function showModal(){
	let newWin = window.open("about:blank", "hello", "left=600,top=200,width=400,height=200,menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no");
	newWin.document.write("Hello!");
}

function getNode() {
	let s = loadSettings();
	if(s){
		return s.node;
	}
	else {
		return "https://api-eos.blckchnd.com";
	}
	
}

function getWallet() {
	return wallet;
}

function loadAccounts(){
	accounts = [];
	for(let i = id('user').options.length - 1 ; i >= 0 ; i--) {
        id('user').remove(i);
    }
	let accs = localStorage.getItem('accounts');
	if(accs){
		accounts = JSON.parse(accs);
		accounts.forEach(function(acc){			
			let option = document.createElement("option");
			option.text = acc;
			option.value = acc;
			id('user').add(option);
		})
	}
}

function loadSettings() {
	let set = localStorage.getItem('settings');
	if(set)	{
		let settings = JSON.parse(set);
		if(settings.node && id('node'))
		{
			id('node').value = settings.node;
		}		
		return settings;
	}
	else{
		id('node').value = "https://eos.greymass.com";
		return null;
	}
	
}

function saveSettings() {
	let settings = new Object();
	if(id('node').value)
	{
		settings.node = id('node').value
		settings.wallet = 'default';
	}
	else
	{
		settings.node = "https://eos.greymass.com";
		settings.wallet = 'default';
	}
	localStorage.setItem('settings', JSON.stringify(settings))
}

function updateAccount(account) {
	let Eoswallet = new owlEosWallet(getNode(), '');
	Eoswallet.eos.getAccount(account).then(acc => {
		//console.log(acc);
		if(acc){
			let bal = 0;
			if(acc.core_liquid_balance)	{
				bal = acc.core_liquid_balance.split(" ")[0];
			}
			if(eos_rate && bal)
			{
				var usd = (eos_rate[0].price_usd * bal).toFixed(2) + ' USD';
				var btc = (eos_rate[0].price_btc * bal).toFixed(5)  + ' BTC';
			}
			else
			{
				var usd = '';
				var btc = '';
			}
			if((acc.net_limit.used / 1048576).toFixed(2) > 0.0) {
				var net_used = (acc.net_limit.used / 1048576).toFixed(2) + ' Mb';
			}
			else if((acc.net_limit.used / 1024).toFixed(2) > 0.0) {
				var net_used = (acc.net_limit.used / 1024).toFixed(2) + ' Kb';
			}
			else if(acc.net_limit.used.toFixed(3) > 0.0) {
				var net_used = acc.net_limit.used.toFixed(3) + ' b';
			}
			
			if((acc.cpu_limit.used /1000000).toFixed(4) > 0.0){
				var cpu_usage = (acc.cpu_limit.used /1000000).toFixed(4) + ' s';
			}
			else
			{
				var cpu_usage = acc.cpu_limit.used;
			}
			if((acc.cpu_limit.available /1000000).toFixed(2) > 0.0){
				var cpu_avail = (acc.cpu_limit.available /1000000).toFixed(2) + ' s';
			}
			else
			{
				var cpu_avail = acc.cpu_limit.available;
			}
			
			let tcpu = Number(acc.total_resources.cpu_weight.split(" ")[0]);
			let tnet = Number(acc.total_resources.net_weight.split(" ")[0]);
			id('cpu').innerHTML = acc.total_resources.cpu_weight;
			id('net').innerHTML = acc.total_resources.net_weight;
			id('cpu_now').innerHTML = acc.total_resources.cpu_weight;
			id('net_now').innerHTML = acc.total_resources.net_weight;
			id('cpu_now2').innerHTML = acc.total_resources.cpu_weight;
			id('net_now2').innerHTML = acc.total_resources.net_weight;
			id('ram_now').innerHTML = ram_price + ' EOS';
			id('ram_now2').innerHTML = ram_price + ' EOS';
			let total = tcpu + tnet;
			
			id('ram1').innerHTML = '<strong>' + Math.round(acc.ram_usage * 10 / 1024)/10 + ' kb</strong> out of <br> <strong>' +  Math.round(acc.ram_quota * 10 / 1024)/10 + '</strong> kb ';
			id('cpu1').innerHTML = '<strong>' + cpu_usage + '</strong> out of <br> <strong>' +  cpu_avail + '</strong>';
			id('net1').innerHTML = '<strong>' + net_used + '</strong> out of <br> <strong>' +  (acc.net_limit.available /1048576).toFixed(2) + ' Mb</strong>';
			id('bal1').innerHTML = '<strong><span class="hg">' + bal + '</span></strong><br>' + usd + '<br>' + btc + '<br><span style="color: blue;">Stacked:<br>' +total + ' EOS</span>';
			circle('b_circle', Math.round(100*acc.ram_usage/acc.ram_quota), 100, '#D3B6C6', '#4B253A');
			if(acc.cpu_limit.available > 0) {
				var x = Math.round(100*acc.cpu_limit.used/acc.cpu_limit.available);
			}
			else {
				var x = 0;
			}
			circle('c_circle', x, 100, '#FFCC66', '#663300');
			if(acc.net_limit.available > 0) {
				var x = Math.round(100*acc.net_limit.used/acc.net_limit.available);
			}
			else{
				var x = 0;
			}
				
			circle('n_circle', x, 100, '#6699FF', '#000066');			
		}
			
	})
}

function updateHistory(account) {
	clearTable('history_table');
	let Eoswallet = new owlEosWallet(getNode(), '');
	Eoswallet.eos.getActions(account, 0, 1000).then(hist => {
		hist.actions.reverse();
		let actual = [];
		let cell = hist.actions[0];
		let btime = '';
		let actfrom = '';
		let actto = '';
		let actw = '';
		//hist.actions.forEach(function(action) {
		for(let action of hist.actions)	{
			// remove duplicated actions
			if(btime == action.block_time && 
				action.action_trace.act.name == 'transfer' && 
				actfrom == action.action_trace.act.data.from && 
				actto == action.action_trace.act.data.to &&
				actw == action.action_trace.act.data.quantity)
			{
				btime = action.block_time;
				actfrom = action.action_trace.act.data.from;
				actto = action.action_trace.act.data.to;
				actw = action.action_trace.act.data.quantity;
				continue;
			}
			btime = action.block_time;
			actfrom = action.action_trace.act.data.from;
			actto = action.action_trace.act.data.to;
			actw = action.action_trace.act.data.quantity;
				
			let dt = new Date(action.block_time);			
			let memo = '';			
			if(action.action_trace.act.name == 'transfer') {
				let from = action.action_trace.act.data.from;
				let to = action.action_trace.act.data.to;
				if(from == account)
				{						
					to = '<strong><span style="color: blue;">' + to + '</span></strong>';
					from = 'me';
				}
				if(to == account)
				{
					from = '<strong><span style="color: green;">' + from + '</span></strong>';
					to = 'me';
				}
				memo = from + ' -> '+ to + ' <strong>' + action.action_trace.act.data.quantity + '</strong> [' + action.action_trace.act.data.memo + ']';
			}
			else if(action.action_trace.act.name == 'buyrambytes') {
				
				memo = action.action_trace.act.data.payer + ' -> <strong><span style="color: blue;">' + action.action_trace.act.data.receiver + '</span></strong> (' + action.action_trace.act.data.bytes + ' bytes)';
			}
			else if(action.action_trace.act.name == 'newaccount') {
				memo = 'Created <strong><span style="color: green;">' + action.action_trace.act.data.name + '</span></strong> account'; 
			}
			else if(action.action_trace.act.name == 'refund') {
				let from = action.action_trace.inline_traces[0].act.data.from; 
				let to = action.action_trace.inline_traces[0].act.data.to; 
				if(from == account) {
					from = 'me';
					to = '<strong><span style="color: blue;">' + to + '</span></strong>';
				}					
				if(to == account) {
					to = 'me';
					from = '<strong><span style="color: green;">' + from + '</span></strong>';
				}
				memo = from + ' -> '+ to + ' <strong>' + action.action_trace.inline_traces[0].act.data.quantity + '</strong> [' + action.action_trace.inline_traces[0].act.data.memo + ']';
			}
			else if(action.action_trace.act.name == 'bidname') {
				memo = 'Bid name <strong><span style="color: green;">' + action.action_trace.act.data.newname + '</span></strong> bid ' + action.action_trace.act.data.bid;
			}
			else if(action.action_trace.act.name == 'undelegatebw') {
				memo = 'Unstake CPU: ' + action.action_trace.act.data.unstake_cpu_quantity + ' and NET: ' + action.action_trace.act.data.unstake_net_quantity;
			}
			else if(action.action_trace.act.name == 'delegatebw') {
				memo = 'Stake CPU: ' + action.action_trace.act.data.stake_cpu_quantity + ' and NET: ' + action.action_trace.act.data.stake_net_quantity;
			}
			else if(action.action_trace.act.name == 'voteproducer') {
				memo = action.action_trace.act.data.producers.join(', ');
			}
			else
			{
				memo = '';
				console.log(action);
			}
			let color = '#ffcc99';
			if(action.action_trace.act.name != 'transfer')
			{
				color = '#ffff99';
				if(action.action_trace.act.name == 'refund')
				{
					color = 'lightgreen';
				}
			}
			else 
			{
				//console.log(action);
				if(action.action_trace.act.data.from == account)
				{
					color = 'lightblue';
				}
				else
				{
					color = 'lightgreen';
				}
			}
			addRow('history_table', 
				dt.toLocaleDateString(getLang()) + '<br>'+ dt.toLocaleTimeString(getLang()), 
				action.action_trace.act.name, 
				memo, color);
		}
	});	
}

function number_format(number, decimals, dec_point, thousands_sep) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

class owlEosWallet {
	constructor(node, login, key) {
		this.node 	= node;
		this.login 	= login;
		
		var config = {
			chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
			keyProvider: [key], 
			httpEndpoint: node,
		}

		this.eos = Eos(config);
		console.log(this.eos);
	}	
	
	transfer(acc, amount, memo, description) {
		tab2.click();
		id('action').value = 'transfer';
		id('transfer_acc').value= acc;
		id('transfer_eos').value = number_format(amount, 4, '.', '');
		id('transfer_memo').value = memo;
		id('description').innerHTML = description;
	}
	
	createAcc(acc, key, ramKbytes, memo, description) {
		tab2.click();
		id('action').value = 'create';
		id('create_acc').value = acc;
		id('create_key').value = key;
		id('create_ram').value = rambytes;
		id('description').innerHTML = description;
	}
	
	buyRam(reciever, ramKbytes, description){
		tab2.click();
		id('action').value = 'buy';
		id('buy_ram').value = ramKbytes;
		id('buy_acc').value = reciever;
		id('description').innerHTML = description;
	}
}

var eos_rate;
var ram_price;
var accounts = [];
var wallet;
getRate();
getRamPrice();
