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
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Tooltip,
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
import { timeFromNow, displayDate, convertVotingPower } from '@/utils/helper'
import {
  fetchBlockByHash,
  fetchCurrentValidatorsList,
  fetchLatestBlocks,
  fetchLatestSignatures,
  fetchTransactionDetail,
} from '@/apis'
import { fromHex } from '@cosmjs/encoding'

type TxDetail = {
  hash: string
  blockId: string
  gasWanted: string
  gasUsed: string
  fee: string
  returnCode: number
  data: string
  tx: string
  txType: string
}

type BlockData = {
  chainId: string
  height: number
  hash: string
  time: string
  proposer: string
}

export default function DetailValidator() {
  const router = useRouter()
  const toast = useToast()
  const { hash } = router.query
  const [signedBlocks, setSignedBlocks] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [validator, setValidator] = useState<any | null>(null)

  useEffect(() => {
    if (hash) {
      setIsLoading(true)
      fetchLatestSignatures(hash as string)
        .then((signedBlocks) => {
          setSignedBlocks(signedBlocks)
        })
        .catch(showError)
        .finally(() => setIsLoading(false))

      fetchCurrentValidatorsList()
        .then((validators) => {
          const validator = validators.find((v: any) => v.address === hash)
          setValidator(validator)
        })
        .catch(showError)
    }
  }, [hash])

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
        <title>Detail Validator | Namada Explorer</title>
        <meta name="description" content="Txs | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Validator</Heading>
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
            <Text color={'cyan.400'}>Validator Detail</Text>
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
            Validator Details
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
          {validator ? (
            <>
              <Text>
                <strong>Address:</strong> {validator.address}
              </Text>
              <Text>
                <strong>Voting Power:</strong>{' '}
                {convertVotingPower(validator.voting_power)} NAAN
              </Text>
              <Text>
                <strong>Moniker:</strong> {validator.moniker}
              </Text>
              <Text>
                <strong>Tendermint Address:</strong>{' '}
                {validator.operator_address}
              </Text>
            </>
          ) : (
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
          )}
        </Box>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Heading size={'md'} mb={4}>
            100 Signed Blocks
          </Heading>
          <Divider borderColor={'gray'} mb={4} />
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
            <>
              <Box display="flex" flexWrap="wrap">
                {signedBlocks?.map((block: any, index: any) => (
                  <Tooltip
                    label={`Block Number: ${block.block_number}`}
                    key={index}
                  >
                    <Box
                      height="20px"
                      width="20px"
                      margin="5px"
                      borderRadius="15%"
                      backgroundColor={
                        block.sign_status
                          ? 'rgb(19, 222, 185)'
                          : 'rgb(250, 137, 107)'
                      }
                    />
                  </Tooltip>
                ))}
              </Box>
              <HStack spacing={5} mt={5} ml={1}>
                <Box display="flex" alignItems="center">
                  <Box
                    height="20px"
                    width="20px"
                    borderRadius="15%"
                    backgroundColor="rgb(19, 222, 185)"
                  />
                  <Text ml={2}>Signed Block</Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box
                    height="20px"
                    width="20px"
                    borderRadius="15%"
                    backgroundColor="rgb(250, 137, 107)"
                  />
                  <Text ml={2}>Missed Block</Text>
                </Box>
              </HStack>
            </>
          )}
        </Box>
      </main>
    </>
  )
}
