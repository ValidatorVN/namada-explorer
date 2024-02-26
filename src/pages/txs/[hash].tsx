import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome, FiCheck, FiX } from 'react-icons/fi'
import NextLink from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTmClient } from '@/store/connectSlice'
import { timeFromNow, displayDate } from '@/utils/helper'
import { fetchBlockByHash, fetchTransactionDetail } from '@/apis'
import { fromHex } from '@cosmjs/encoding'

type TxDetail = {
  hash: string
  blockId: string
  gasWanted: string
  gasUsed: string
  fee: string
  returnCode: number
  data: string
  tx: any
  txType: string
}

type BlockData = {
  chainId: string
  height: number
  hash: string
  time: string
  proposer: string
}

export default function DetailTransaction() {
  const router = useRouter()
  const toast = useToast()
  const { hash } = router.query
  const tmClient = useSelector(selectTmClient)
  const [tx, setTx] = useState<TxDetail | null>(null)
  const [block, setBlock] = useState<BlockData | null>(null)

  useEffect(() => {
    if (hash) {
      fetchTransactionDetail(hash as string)
        .then((res) => {
          const tx = {
            hash: res.hash,
            blockId: res.block_id,
            gasWanted: '0',
            gasUsed: '0',
            returnCode: res.return_code,
            fee: res.fee_amount_per_gas_unit ? res.fee_amount_per_gas_unit : 0,
            data: res.data,
            tx:
              res.tx_type == 'Decrypted' && res.tx && res.tx.Ibc
                ? {
                    typeUrl: res.tx.Ibc.Any.type_url,
                    value: [...res.tx.Ibc.Any.value.slice(0, 10), '...'],
                  }
                : { ...res.tx },
            txType: res.tx_type,
          } as TxDetail
          const hexData = fromHex(tx.data)
          const text = new TextDecoder('utf-8').decode(hexData)
          console.log('text', text)
          setTx(tx)
        })
        .catch(showError)
    }
  }, [hash])

  useEffect(() => {
    if (tx?.blockId) {
      fetchBlockByHash(tx?.blockId)
        .then((res) => {
          const block = {
            chainId: res.header.chain_id,
            height: res.header.height,
            hash: res.block_id,
            time: res.header.time,
            proposer: res.header.proposer_address,
          } as BlockData
          setBlock(block)
        })
        .catch(showError)
    }
  }, [tmClient, tx])

  const showError = (err: Error) => {
    const errMsg = err.message
    let error = null
    try {
      error = JSON.parse(errMsg)
    } catch (e) {
      error = {
        message: 'Invalid',
        data: errMsg,
      }
    }

    toast({
      title: error.message,
      description: error.data,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  }

  return (
    <>
      <Head>
        <title>Detail Transaction | Namada Explorer</title>
        <meta name="description" content="Txs | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Transaction</Heading>
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
            <Text color={'cyan.400'}>Transaction Detail</Text>
          </Link>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            Information
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
                    <b>Tx Hash</b>
                  </Td>
                  <Td>{tx?.hash}</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Status</b>
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
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Height</b>
                  </Td>
                  <Td>
                    <Link
                      as={NextLink}
                      href={'/blocks/' + block?.height}
                      style={{ textDecoration: 'none' }}
                      _focus={{ boxShadow: 'none' }}
                    >
                      <Text color={'cyan.400'}>{block?.height}</Text>
                    </Link>
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Time</b>
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
                    <b>Fee</b>
                  </Td>
                  <Td>{tx?.fee} NAAN</Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Gas (used / wanted)</b>
                  </Td>
                  <Td>
                    {tx?.gasUsed ? `${tx.gasUsed} / ${tx.gasWanted}` : ''}
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Shielded</b>
                  </Td>
                  <Td>
                    {tx && tx.tx && tx.tx.Transfer && tx.tx.Transfer.shielded
                      ? 'Yes'
                      : 'No'}
                  </Td>
                </Tr>
                <Tr>
                  <Td pl={0} width={150}>
                    <b>Memo</b>
                  </Td>
                  <Td>{}</Td>
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
            Raw Data
          </Heading>
          <Box
            overflow="auto"
            maxHeight="500px"
            bg={useColorModeValue('silver', 'gray.800')}
          >
            <pre>{JSON.stringify(tx, null, 2)}</pre>
          </Box>
        </Box>
      </main>
    </>
  )
}
