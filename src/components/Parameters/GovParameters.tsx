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

type ProposalParameters = {
  minProposalFund: number
  maxProposalCodeSize: number
  minProposalVotingPeriod: number
  maxProposalPeriod: number
  maxProposalContentSize: number
  minProposalGraceEpochs: number
}

export default function GovParameters() {
  const [params, setParams] = useState({})
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchAndConvertToJSON()
      .then((response) => {
        console.log(response)
        if (response) {
          const govParameters = {
            minProposalFund: response.gov_params.min_proposal_fund,
            maxProposalCodeSize: response.gov_params.max_proposal_code_size,
            minProposalVotingPeriod:
              response.gov_params.min_proposal_voting_period,
            maxProposalPeriod: response.gov_params.max_proposal_period,
            maxProposalContentSize:
              response.gov_params.max_proposal_content_size,
            minProposalGraceEpochs:
              response.gov_params.min_proposal_grace_epochs,
          } as ProposalParameters

          console.log(govParameters)
          setParams(govParameters)
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
