import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  Text,
  useColorModeValue,
  Tag,
  Badge,
  Stack,
  Progress,
  Tooltip,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import DataTable from '@/components/Datatable'
import { createColumnHelper } from '@tanstack/react-table'
import { fetchProposals } from '@/apis'
import { trimHashLowerCase } from '@/utils/helper'

type Proposal = {
  id: number
  author: string
  types: string
  status: string
  startEpoch: number
  endEpoch: number
  yesPercentage: number
  noPercentage: number
  abstainPercentage: number
}

type ColorStatus = 'Pending' | 'Passed' | 'VotingPeriod' | 'Rejected'

const color: Record<ColorStatus, string> = {
  Pending: 'gray',
  Passed: 'green',
  VotingPeriod: 'orange',
  Rejected: 'red',
}

const columnHelper = createColumnHelper<Proposal>()

const columns = [
  columnHelper.accessor('id', {
    cell: (info) => `#${info.getValue()}`,
    header: '#ID',
  }),
  columnHelper.accessor('author', {
    cell: (info) => trimHashLowerCase(info.getValue()),
    header: 'Author',
  }),
  columnHelper.accessor('types', {
    cell: (info) => <Tag colorScheme="cyan">{info.getValue()}</Tag>,
    header: 'Types',
  }),
  columnHelper.accessor('status', {
    cell: (info) => {
      const value = info.getValue() as ColorStatus
      if (!value) {
        return <Badge colorScheme={color['Pending']}>{value}</Badge>
      }

      return <Badge colorScheme={color[value]}>{value}</Badge>
    },
    header: 'Status',
  }),
  columnHelper.accessor('startEpoch', {
    cell: (info) => info.getValue(),
    header: 'Start Epoch',
    meta: {
      width: 20,
    },
  }),

  columnHelper.accessor('endEpoch', {
    cell: (info) => info.getValue(),
    header: 'End Epoch',
    meta: {
      width: 20,
    },
  }),
  columnHelper.accessor('yesPercentage', {
    cell: (info) => {
      if (info.row.original.status === 'Pending') {
        return <Progress bg="gray.200" height={3} width={200} border={1} />
      }

      const yesPercentage = info.row.original.yesPercentage * 100
      const abstainPercentage = info.row.original.abstainPercentage * 100
      const noPercentage = 100 - yesPercentage - abstainPercentage

      return (
        <Stack direction="row" width={200} height={3} spacing={0}>
          <Tooltip label={`${yesPercentage.toFixed(2)}% Yes`}>
            <Box bg="green.500" width={`${yesPercentage}%`} />
          </Tooltip>
          <Tooltip label={`${noPercentage.toFixed(2)}% No`}>
            <Box bg="red.500" width={`${noPercentage}%`} />
          </Tooltip>
          <Tooltip label={`${abstainPercentage.toFixed(2)}% Abstain`}>
            <Box bg="gray" width={`${abstainPercentage}%`} />
          </Tooltip>
        </Stack>
      )
    },
    header: 'Votes',
  }),
]

export default function Proposals() {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(20)
  const [total, setTotal] = useState(0)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchProposals().then((proposals) => {
      setTotal(proposals.length ?? 0)
      const startIndex = page * perPage
      const endIndex = startIndex + perPage

      const proposalsList: Proposal[] = proposals
        .sort((a: any, b: any) => b.id - a.id)
        .slice(startIndex, endIndex)
        .map((proposal: any) => {
          const yesVote = proposal.yay_votes / 1000_000_000
          const noVote = proposal.nay_votes / 1000_000_000
          const abstainVote = proposal.abstain_votes / 1000_000_000
          const totalVote = yesVote + noVote + abstainVote
          let yesPercentage = 0
          let noPercentage = 0
          let abstainPercentage = 0
          if (totalVote !== 0) {
            yesPercentage = yesVote / totalVote
            noPercentage = noVote / totalVote
            abstainPercentage = abstainVote / totalVote
          }

          return {
            id: proposal.id,
            author: proposal.author.Account,
            types: proposal.kind,
            status: proposal.result,
            startEpoch: proposal.start_epoch,
            endEpoch: proposal.end_epoch,
            yesPercentage,
            noPercentage,
            abstainPercentage,
          }
        })

      setProposals(proposalsList)
      setIsLoading(false)
    })
  }, [page, perPage])

  const onChangePagination = (value: {
    pageIndex: number
    pageSize: number
  }) => {
    setPage(value.pageIndex)
    setPerPage(value.pageSize)
  }

  return (
    <>
      <Head>
        <title>Proposals | Namada Explorer</title>
        <meta name="description" content="Proposals | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Proposals</Heading>
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
          <Text>Proposals</Text>
        </HStack>
        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <DataTable
            columns={columns}
            data={proposals}
            total={total}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
          />
        </Box>
      </main>
    </>
  )
}
