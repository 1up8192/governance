pragma solidity 0.5.16;

contract Governable {
    uint256 private _x;
    address private _owner;

    modifier onlyOwner { require (msg.sender == _owner, "Governable: only owner"); _; }

    constructor(address owner) public {
      _owner = owner;
    }

    function setX(uint256 x) external onlyOwner {
      _x = x;
    }

    function getX() external view returns (uint256) {
      return _x;
    }
}
