pragma solidity ^0.8.0;

contract Token {
    string private name;
    string private symbol;
    uint8 private decimals;
    uint256 private totalSupply;
    address private owner;
    mapping(address => string) addressToName;
    address[] addresses;
    mapping(address => uint256) addressForInt;

// créer une variable _allowances
// enregistre pour une addresse les somme que d'autres addresses peuvent transférer

// function approve(_spender, _value) return bool
// Autorise l'addresse _spender à transférer vos fond jusqu'à un maximum de _value  
// renvoyer un boolen si tout c'est bien passé

// function transferFrom(_from, _to, _value)
// transfert la quantité _value de l'adresse _from à l'adresse _to et doit emettre l'évènemt Transfer
// vérifier qu'_allowances contient bien l'autorisation de transfert
// renvoyer un boolen si tout c'est bien passé

// function allowance(_owner, _spender) return uint256
// Retourne le montant que _spender est encore autorisé à retirer de _owner

// Créer un évènement Transfer(_from, _to, _value)

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT THE OWNER");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        owner = msg.sender;
    }

    /**
     * SETTERS
     */

    function setName(string memory _name) public onlyOwner {
        name = _name;
    }

    function setMapName(string memory _name) public {
        addressToName[msg.sender] = _name;
        addresses.push(msg.sender);
    }

    function mint(uint256 _amount) public {
        addressForInt[msg.sender] = _amount;
    }

    // function transfer(_to,_value) return bool
    // en utilisant la variable addressForInt
    // enlever à l'utilisateur courant (sender) la valeur de _value
    // l'ajouter à l'utilisateur _to
    // renvoyer un boolen si tout c'est bien passé
    function transfer(address _to, uint256 _value) public returns(bool) {
        address from = msg.sender;
        uint256 fromBalance = addressForInt[from];
        require(fromBalance >= _value, "transfer amount exceeds balance");

        addressForInt[from] = fromBalance - _value;
        addressForInt[_to] += _value;

        return true;
    }

    /**
     * GETTERS
     */

    function getName() public view returns(string memory _name) {
        _name = name;
    }
    function getSymbol() public view returns(string memory) {
        return symbol;
    }
    function getDecimals() public view returns(uint8) {
        return decimals;
    }
    function getTotalSupply() public view returns(uint256) {
        return totalSupply;
    }

    function balanceOf(address _address) public view returns(uint256) {
        return addressForInt[_address];
    }

    function getAllNames() public returns(string[] memory names_) {
        string[] memory names = new string[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            names[i] = addressToName[addresses[i]];
        }
        names_ = names;
        return names_;
    }

}