// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ChainProofAccessControl is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        _grantRole(REGISTRAR_ROLE, defaultAdmin);
        _grantRole(OFFICER_ROLE, defaultAdmin);
        _grantRole(AUDITOR_ROLE, defaultAdmin);
    }

    function addRegistrar(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(REGISTRAR_ROLE, account);
    }

    function addOfficer(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(OFFICER_ROLE, account);
    }

    function addAuditor(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(AUDITOR_ROLE, account);
    }

    function revokeRegistrar(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(REGISTRAR_ROLE, account);
    }

    function revokeOfficer(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(OFFICER_ROLE, account);
    }

    function revokeAuditor(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(AUDITOR_ROLE, account);
    }
}
