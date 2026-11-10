import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { serverError } from '@/lib/http/errors';

const rpcUrl = process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(rpcUrl);

export async function GET(request: Request, { params }: { params: { txHash: string } }) {
  try {
    const tx = await provider.getTransaction(params.txHash);
    const receipt = await provider.getTransactionReceipt(params.txHash);

    if (!tx || !receipt) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        timestamp: tx.blockNumber ? (await provider.getBlock(tx.blockNumber))?.timestamp : null,
        from: tx.from,
        to: tx.to,
        status: receipt.status === 1 ? 'SUCCESS' : 'FAILED',
        gasUsed: receipt.gasUsed.toString(),
      }
    });
  } catch (error) {
    return serverError('/api/blockchain/verify/[txHash]', error, 'Internal Server Error');
  }
}
