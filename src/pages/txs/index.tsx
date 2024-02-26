import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Spinner } from '@chakra-ui/react'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  useColorModeValue,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tabs,
  Tag,
  TagLeftIcon,
  TagLabel,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome, FiCheck, FiX } from 'react-icons/fi'
import { timeFromNow, trimHash } from '@/utils/helper'
import { fetchBlockByHash, fetchTransactions } from '@/apis'

const MAX_ROWS = 20

type TxData = {
  height: number
  hash: string
  returnCode: number
  time: string
  txType: string
  tx: any
}

type BlockData = {
  blockId: string
  height: number
  time: string
}

export default function Transactions() {
  const blocks: Map<string, BlockData> = new Map()
  const blockPromises: Map<string, Promise<any>> = new Map()
  const [txs, setTxs] = useState<TxData[]>([])
  const [loading, setLoading] = useState(true) // New state variable

  useEffect(() => {
    fetchTransactions(1, MAX_ROWS).then(async (res) => {
      await Promise.all(
        res.data.map(async (tx: any) => {
          const block = blocks.get(tx.block_id)

          if (!block) {
            let blockPromise = blockPromises.get(tx.block_id)

            if (!blockPromise) {
              blockPromise = fetchBlockByHash(tx.block_id).then((block) => {
                blocks.set(tx.block_id, {
                  blockId: tx.block_id,
                  height: block.header.height,
                  time: block.header.time,
                })
                blockPromises.delete(tx.block_id)
                return block
              })
              blockPromises.set(tx.block_id, blockPromise)
            }
            const block = await blockPromise
            return {
              height: block.header.height,
              hash: tx.hash,
              time: block.header.time,
              returnCode: tx.return_code,
              txType: tx.tx_type,
              tx: tx.tx,
            }
          }

          return {
            height: block.height,
            hash: tx.hash,
            time: block.time,
            returnCode: tx.return_code,
          }
        })
      ).then((txs) => {
        setTxs(txs)
        setLoading(false)
      })
    })
  }, [])

  return (
    <>
      <Head>
        <title>Transactions | Namada Explorer</title>
        <meta name="description" content="Transactions | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Transactions</Heading>
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
          <Text>Transactions</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Tabs variant="unstyled">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tx Hash</Th>
                  <Th>Status</Th>
                  <Th>Height</Th>
                  <Th>Type</Th>
                  <Th>Shielded</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              {loading ? (
                <Tbody>
                  <Tr>
                    <Td colSpan={4}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '200px', // Or any other height
                        }}
                      >
                        <Spinner size="xl" />
                      </div>
                    </Td>
                  </Tr>
                </Tbody>
              ) : (
                <Tbody>
                  {txs?.map((tx) => (
                    <Tr key={tx.hash.toUpperCase()}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={'/txs/' + tx.hash}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text color={'cyan.400'}>{trimHash(tx.hash)}</Text>
                        </Link>
                      </Td>
                      <Td>
                        {tx?.returnCode == 0 || tx?.txType == 'Wrapper' ? (
                          <Tag variant="subtle" colorScheme="green">
                            <TagLeftIcon as={FiCheck} />
                            <TagLabel>Success</TagLabel>
                          </Tag>
                        ) : (
                          <Tag variant="subtle" colorScheme="red">
                            <TagLeftIcon as={FiX} />
                            <TagLabel>Error</TagLabel>
                          </Tag>
                        )}
                      </Td>
                      <Td>
                        {tx &&
                        tx.tx &&
                        tx.tx.Transfer &&
                        tx.tx.Transfer.shielded
                          ? 'Yes'
                          : 'No'}
                      </Td>

                      <Td>{tx.tx ? Object.keys(tx.tx)[0] : tx.txType}</Td>
                      <Td>{tx.height}</Td>
                      <Td>{timeFromNow(tx.time)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              )}
            </Table>
          </Tabs>
        </Box>
      </main>
    </>
  )
}
