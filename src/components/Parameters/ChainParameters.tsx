import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { camelCaseToTitleCase, fetchAndConvertToJSON } from '@/utils/helper'

type ChainParameters = {
  maxTxBytes: number
  nativeToken: string
  minNumOfBlocks: number
  maxExpectedTimePerBlock: number
  maxProposalBytes: number
  epochsPerYear: number
  maxSignaturesPerTransaction: number
  maxBlockGas: number
  feeUnshieldingGasLimit: number
  feeUnshieldingDescriptionsLimit: number
  minimumGasPrice: string
}

export default function ChainParameters() {
  const [params, setParams] = useState({})
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchAndConvertToJSON()
      .then((response) => {
        console.log(response)
        if (response) {
          const chainParameters = {
            maxTxBytes: response.parameters.max_tx_bytes,
            nativeToken: response.parameters.native_token,
            minNumOfBlocks: response.parameters.min_num_of_blocks,
            maxExpectedTimePerBlock:
              response.parameters.max_expected_time_per_block,
            maxProposalBytes: response.parameters.max_proposal_bytes,
            epochsPerYear: response.parameters.epochs_per_year,
            maxSignaturesPerTransaction:
              response.parameters.max_signatures_per_transaction,
            maxBlockGas: response.parameters.max_block_gas,
            feeUnshieldingGasLimit:
              response.parameters.fee_unshielding_gas_limit,
            feeUnshieldingDescriptionsLimit:
              response.parameters.fee_unshielding_descriptions_limit,
            minimumGasPrice: response.parameters?.minimum_gas_price?.naan,
          } as ChainParameters
          setParams(chainParameters)
          setIsLoaded(true)
        }
      })
      .catch((err) => {
        console.error(err)
        setIsHidden(true)
      })

    if (params) {
      setIsLoaded(true)
    }
  }, [])

  return (
    <Box
      mt={6}
      bg={useColorModeValue('light-container', 'dark-container')}
      shadow={'base'}
      borderRadius={4}
      p={6}
      hidden={isHidden}
    >
      <Flex mb={8} alignItems={'center'} gap={2}>
        <Tooltip
          label="These are values of parameters for minting a block."
          fontSize="sm"
        >
          <InfoOutlineIcon
            boxSize={5}
            justifyItems={'center'}
            color={useColorModeValue('light-theme', 'dark-theme')}
          />
        </Tooltip>
        <Heading size={'md'} fontWeight={'medium'}>
          Chain Parameters
        </Heading>
      </Flex>
      <SimpleGrid minChildWidth="200px" spacing="40px" pl={4}>
        {params &&
          Object.entries(params).map(([paramKey, paramValue]) => (
            <Skeleton key={paramKey} isLoaded={isLoaded}>
              <Box>
                <Heading size="xs" fontWeight={'normal'}>
                  {camelCaseToTitleCase(paramKey)}
                </Heading>
                <Text pt="2" fontSize="lg" fontWeight={'medium'}>
                  {typeof paramValue === 'number'
                    ? paramValue.toLocaleString()
                    : typeof paramValue === 'string'
                    ? paramValue.toUpperCase()
                    : ''}
                </Text>
              </Box>
            </Skeleton>
          ))}
      </SimpleGrid>
    </Box>
  )
}
