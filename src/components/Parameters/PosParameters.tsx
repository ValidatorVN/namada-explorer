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
type PosParametersProps = {
  maxValidatorSlots: number
  pipelineLength: number
  unbondingLength: number
  TMVotesPerToken: string
  blockProposerReward: string
  blockVoteReward: string
  maxInflationRate: string
  targetStakedRatio: string
  duplicateVoteMinSlashRate: string
  lightClientAttackMinSlashRate: string
  cubicSlashingWindowLength: number
  validatorStakeThreshold: string
  livenessWindowCheck: number
  livenessThreshold: string
  rewardsGainP: string
  rewardsGainD: string
}

export default function PoSParameters() {
  const [params, setParams] = useState({})
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchAndConvertToJSON()
      .then((response) => {
        if (response) {
          const posParameters = {
            maxValidatorSlots: response.pos_params.max_validator_slots,
            pipelineLength: response.pos_params.pipeline_len,
            unbondingLength: response.pos_params.unbonding_len,
            TMVotesPerToken: response.pos_params.tm_votes_per_token,
            blockProposerReward: response.pos_params.block_proposer_reward,
            blockVoteReward: response.pos_params.block_vote_reward,
            maxInflationRate: response.pos_params.max_inflation_rate,
            targetStakedRatio: response.pos_params.target_staked_ratio,
            duplicateVoteMinSlashRate:
              response.pos_params.duplicate_vote_min_slash_rate,
            lightClientAttackMinSlashRate:
              response.pos_params.light_client_attack_min_slash_rate,
            cubicSlashingWindowLength:
              response.pos_params.cubic_slashing_window_length,
            validatorStakeThreshold:
              response.pos_params.validator_stake_threshold,
            livenessWindowCheck: response.pos_params.liveness_window_check,
            livenessThreshold: response.pos_params.liveness_threshold,
            rewardsGainP: response.pos_params.rewards_gain_p,
            rewardsGainD: response.pos_params.rewards_gain_d,
          } as PosParametersProps

          setParams(posParameters)
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
          Proof of Stake Parameters
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
                    : (paramValue ?? '').toString()}
                </Text>
              </Box>
            </Skeleton>
          ))}
        {/* <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Epochs per Year
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.parameters.epochs_per_year.low.toLocaleString() ?? ''}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Goal Bonded
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.goalBonded)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Inflation Max
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.inflationMax)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Inflation Min
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.inflationMin)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Inflation Rate Change
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {convertRateToPercent(params?.inflationRateChange)}
            </Text>
          </Box>
        </Skeleton>
        <Skeleton isLoaded={isLoaded}>
          <Box>
            <Heading size="xs" fontWeight={'normal'}>
              Mint Denom
            </Heading>
            <Text pt="2" fontSize="lg" fontWeight={'medium'}>
              {params?.mintDenom ?? ''}
            </Text>
          </Box>
        </Skeleton> */}
      </SimpleGrid>
    </Box>
  )
}
