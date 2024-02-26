import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { NewBlockEvent, TxEvent } from '@cosmjs/tendermint-rpc'
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
  Spinner,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { selectNewBlock } from '@/store/streamSlice'
import { toHex } from '@cosmjs/encoding'
import { timeFromNow, trimHash } from '@/utils/helper'
import { fetchBlocks } from '@/apis'

const MAX_ROWS = 20

interface Tx {
  TxEvent: TxEvent
  Timestamp: Date
}

type BlockData = {
  height: number
  hash: string
  txs: number
  time: string
  proposer?: string
}

export default function Blocks() {
  const newBlock = useSelector(selectNewBlock)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [loading, setLoading] = useState(true) // New state variable

  useEffect(() => {
    if (newBlock) {
      updateBlocks(newBlock)
    }
  }, [newBlock])

  useEffect(() => {
    fetchBlocks(1, MAX_ROWS).then((res) => {
      const oldblocks = res.data.map((block: any) => {
        return {
          height: block.header.height,
          hash: block.block_id,
          txs: block.tx_hashes.length,
          time: block.header.time,
          proposer: block.header.proposer_address,
        }
      })
      setLoading(false)
      setBlocks(oldblocks)
    })
  }, [])

  const updateBlocks = (block: NewBlockEvent) => {
    const cookedBlock = {
      height: block.header.height,
      hash: toHex(block.lastCommit?.blockId.hash || block.header.appHash),
      txs: block.txs.length,
      time: block.header.time.toISOString(),
      proposer: toHex(block.header.proposerAddress),
    }
    if (blocks.length) {
      if (block.header.height > blocks[0].height) {
        setBlocks((prevBlocks) => [
          cookedBlock,
          ...prevBlocks.slice(0, MAX_ROWS - 1),
        ])
      }
    } else {
      setBlocks([cookedBlock])
    }
  }

  return (
    <>
      <Head>
        <title>Blocks | Namada Explorer</title>
        <meta name="description" content="Blocks | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Blocks</Heading>
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
          <Text>Blocks</Text>
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
                  <Th>Height</Th>
                  <Th>Block ID</Th>
                  <Th>Txs</Th>
                  <Th>Proposer</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>

              {loading ? (
                <Tbody>
                  <Tr>
                    <Td colSpan={6}>
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
                  {blocks?.map((block) => (
                    <Tr key={block.height}>
                      <Td>
                        <Link
                          as={NextLink}
                          href={'/blocks/' + block.height}
                          style={{ textDecoration: 'none' }}
                          _focus={{ boxShadow: 'none' }}
                        >
                          <Text color={'cyan.400'}>{block.height}</Text>
                        </Link>
                      </Td>
                      <Td noOfLines={1}>{trimHash(block.hash)}</Td>
                      <Td>{block.txs}</Td>
                      <Td>{block.proposer}</Td>
                      <Td>{timeFromNow(block.time)}</Td>
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
