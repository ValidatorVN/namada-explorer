import { Account, Block, Coin, StargateClient } from '@cosmjs/stargate'
import {
  Comet38Client,
  TxSearchResponse,
  ValidatorsResponse,
} from '@cosmjs/tendermint-rpc'

export async function getChainId(tmClient: Comet38Client): Promise<string> {
  const client = await StargateClient.create(tmClient)
  return client.getChainId()
}

export async function getValidators(
  tmClient: Comet38Client
): Promise<ValidatorsResponse> {
  return tmClient.validatorsAll()
}
export async function getValidatorPagination(
  tmClient: Comet38Client,
  page: number,
  perPage: number
): Promise<ValidatorsResponse> {
  return tmClient.validators({
    page: page,
    per_page: perPage,
  })
}

export async function getAccount(
  tmClient: Comet38Client,
  address: string
): Promise<Account | null> {
  const client = await StargateClient.create(tmClient)
  return client.getAccount(address)
}

export async function getAllBalances(
  tmClient: Comet38Client,
  address: string
): Promise<readonly Coin[]> {
  const client = await StargateClient.create(tmClient)
  return client.getAllBalances(address)
}

export async function getBalanceStaked(
  tmClient: Comet38Client,
  address: string
): Promise<Coin | null> {
  const client = await StargateClient.create(tmClient)
  return client.getBalanceStaked(address)
}
