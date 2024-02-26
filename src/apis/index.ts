export async function fetchValidators(
  page: number,
  perPage: number,
  options?: RequestInit
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RPC_URL}/validators?page=${page}&per_page=${perPage}`,
      options
    )
    const { result } = await response.json()
    return result
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchLastBlock() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/block/last`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchValidatorUptime(
  address: string,
  start: number,
  end: number
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/validator/${address}/uptime?start=${start}&end=${end}`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchValidatorCommitSignatures(address: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/validator/${address}/commit_signatures`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchBlocks(
  page: number,
  perPage: number,
  options?: RequestInit
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/block?page=${page}&page_size=${perPage}`,
      options
    )
    const res = await response.json()
    return res
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchBlockDetail(height: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/block/height/${height}`
    )
    const res = await response.json()
    return res
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchBlockByHash(hash: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/block/hash/${hash}`
    )
    const res = await response.json()
    return res
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchTransactionDetail(hash: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/tx/${hash}`
    )
    const res = await response.json()
    return res
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchTransactions(page: number, perPage: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/tx?page=${page}&page_size=${perPage}`
    )
    const res = await response.json()
    return res
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchProposals() {
  try {
    const response = await fetch(
      'https://it.api.namada.red/api/v1/chain/governance/proposals'
    )
    const { proposals } = await response.json()

    return proposals
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchCurrentValidatorsList(options?: RequestInit) {
  try {
    const response = await fetch(
      'https://namada-explorer-api.stakepool.dev.br/node/validators/list',
      options
    )
    const data = await response.json()
    return data.currentValidatorsList
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchLatestBlocks(address: string) {
  try {
    const response = await fetch(
      `https://namada-explorer-api.stakepool.dev.br/node/validators/validator/${address}/latestBlocks`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('An error occurred while fetching the data.', error)
    return null
  }
}

export async function fetchLatestSignatures(address: string) {
  try {
    const response = await fetch(
      `https://namada-explorer-api.stakepool.dev.br/node/validators/validator/${address}/latestSignatures`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('An error occurred while fetching the data.', error)
    return null
  }
}
