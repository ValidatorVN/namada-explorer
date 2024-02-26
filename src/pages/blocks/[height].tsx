import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { timeFromNow, displayDate } from '@/utils/helper'
import { fetchBlockDetail } from '@/apis'

type TxInfo = {
  hash: string
  returnCode: number
  amount: number
}

type BlockDetail = {
  chainId: string
  height: number
  appHash: string
  txs: number
  time: string
  blockId: string
  proposer: string
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function fetchWithRetry(
  fetchFunction: () => Promise<any>,
  retries: number = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const result = await fetchFunction()
    if (result !== null) {
      return result
    }
    await delay(1500)
  }
  return null
}

export default function DetailBlock() {
  const router = useRouter()
  const { height } = router.query
  const [block, setBlock] = useState<BlockDetail | null>(null)
  const [txs, setTxs] = useState<TxInfo[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (height) {
      setLoading(true)
      fetchWithRetry(() => fetchBlockDetail(parseInt(height as string)), 3)
        .then((res) => {
          if (res) {
            const blockDetail = {
              chainId: res?.header.chain_id,
              height: res?.header.height,
              appHash: res?.header.app_hash,
              txs: res?.tx_hashes.length,
              time: res?.header.time,
              blockId: res?.block_id.toString().toUpperCase(),
              proposer: res?.header.proposer_address,
            } as BlockDetail

            const txs = res?.tx_hashes?.map((tx: any) => {
              return {
                hash: tx.hash_id.toString().toUpperCase(),
                amount: 0,
              }
            })
            setBlock(blockDetail)
            setTxs(txs)
          }
          setLoading(false)
        })
        .catch((error) => {
          setLoading(false)
          console.error(error)
        })
    }
  }, [height])

  return (
    <>
      <Head>
        <title>Detail Block | Dexplorer</title>
        <meta name="description" content="Block | Dexplorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Spinner size="xl" />
        </div>
      ) : (
        <main>
          <HStack h="24px">
            <Heading size={'md'}>Block</Heading>
            <Divider borderColor={'gray'} size="10px" orientation="vertical" />
            <Link
              as={NextLink}
              href={'/'}
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
              display="flex"
              justifyContent="center"
            >
              <Icon
                fontSize="16"
                color={useColorModeValue('light-theme', 'dark-theme')}
                as={FiHome}
              />
            </Link>
            <Icon fontSize="16" as={FiChevronRight} />
            <Link
              as={NextLink}
              href={'/blocks'}
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
            >
              <Text color={useColorModeValue('light-theme', 'dark-theme')}>
                Blocks
              </Text>
            </Link>
            <Icon fontSize="16" as={FiChevronRight} />
            <Text>Block #{height}</Text>
          </HStack>
          <Box
            mt={8}
            bg={useColorModeValue('light-container', 'dark-container')}
            shadow={'base'}
            borderRadius={4}
            p={4}
          >
            <Heading size={'md'} mb={4}>
              Header
            </Heading>
            <Divider borderColor={'gray'} mb={4} />
            <TableContainer>
              <Table variant="unstyled" size={'sm'}>
                <Tbody>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Chain Id</b>
                    </Td>
                    <Td>{block?.chainId}</Td>
                  </Tr>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Height</b>
                    </Td>
                    <Td>{block?.height}</Td>
                  </Tr>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Block Time</b>
                    </Td>
                    <Td>
                      {block?.time
                        ? `${timeFromNow(block?.time)} ( ${displayDate(
                            block?.time
                          )} )`
                        : ''}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Block App Hash</b>
                    </Td>
                    <Td>{block?.appHash}</Td>
                  </Tr>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Block Id</b>
                    </Td>
                    <Td>{block?.blockId}</Td>
                  </Tr>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Number of Tx</b>
                    </Td>
                    <Td>{block?.txs}</Td>
                  </Tr>
                  <Tr>
                    <Td pl={0} width={150}>
                      <b>Proposer</b>
                    </Td>
                    <Td>{block?.proposer}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          <Box
            mt={8}
            bg={useColorModeValue('light-container', 'dark-container')}
            shadow={'base'}
            borderRadius={4}
            p={4}
          >
            <Heading size={'md'} mb={4}>
              Transactions
            </Heading>
            <Divider borderColor={'gray'} mb={4} />
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tx Hash</Th>
                    {/* <Th>Status</Th>
                  <Th>Fee</Th> */}
                    <Th>Height</Th>
                    <Th>Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {txs?.map((tx) => (
                    <Tr key={tx.hash}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={'/txs/' + tx.hash.toUpperCase()}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text color={'cyan.400'}>{tx.hash}</Text>
                        </Link>
                      </Td>
                      <Td>{height}</Td>
                      <Td>{block?.time ? timeFromNow(block?.time) : ''}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </main>
      )}
    </>
  )
}
