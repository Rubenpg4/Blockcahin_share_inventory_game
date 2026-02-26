// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EAIGold — Token de utilidad del Ecosistema de Activos Interoperables
 * @notice ERC-20 que se compra con ETH a tasa fija: 1 GOLD = 0.00058 ETH.
 *         Los usuarios llaman a mintGold() enviando ETH y reciben GOLD al instante.
 */
contract EAIGold is ERC20, Ownable {
    /// @notice Coste en wei de 1 token GOLD (con 18 decimales)
    /// 1 GOLD = 0.00058 ETH = 580_000_000_000_000 wei
    uint256 public constant GOLD_PRICE = 580_000_000_000_000; // 0.00058 ether

    // ─── Eventos ────────────────────────────────────────────────────────────────

    event GoldMinted(
        address indexed buyer,
        uint256 ethSpent,
        uint256 goldReceived
    );
    event ETHWithdrawn(address indexed to, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor(
        address initialOwner
    ) ERC20("EAI Gold", "GOLD") Ownable(initialOwner) {}

    // ─── Mint (compra con ETH) ──────────────────────────────────────────────────

    /**
     * @notice Compra tokens GOLD enviando ETH.
     *         Calcula automáticamente cuántos GOLD entregar según msg.value.
     *         Fórmula: goldAmount = msg.value * 1e18 / GOLD_PRICE
     */
    function mintGold() external payable {
        require(msg.value > 0, "EAIGold: must send ETH");

        // msg.value está en wei, GOLD_PRICE es wei/GOLD.
        // Multiplicamos por 1e18 para mantener 18 decimales en el token.
        uint256 goldAmount = (msg.value * 1e18) / GOLD_PRICE;
        require(goldAmount > 0, "EAIGold: ETH amount too small");

        _mint(msg.sender, goldAmount);
        emit GoldMinted(msg.sender, msg.value, goldAmount);
    }

    // ─── Retiro de ETH acumulado ────────────────────────────────────────────────

    /**
     * @notice Retira todo el ETH acumulado en el contrato. Solo el owner.
     * @param to Dirección receptora del ETH.
     */
    function withdrawETH(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "EAIGold: no ETH to withdraw");

        (bool sent, ) = to.call{value: balance}("");
        require(sent, "EAIGold: ETH transfer failed");
        emit ETHWithdrawn(to, balance);
    }
}
