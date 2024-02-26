import Head from 'next/head'
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  useColorModeValue,
  Text,
  Input,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { FiShield, FiHome } from 'react-icons/fi'
import DataTable from '@/components/Datatable'
import { createColumnHelper } from '@tanstack/react-table'
import { convertVotingPower } from '@/utils/helper'
import {
  fetchCurrentValidatorsList,
  fetchLastBlock,
  fetchValidatorCommitSignatures,
  fetchValidatorUptime,
} from '@/apis'

type ValidatorData = {
  validator: string
  uptime: number
  votingPower: string
  commitSignatures: number
  participation: number
  moniker: string
  tmAddress: string
}

const columnHelper = createColumnHelper<ValidatorData>()

const columns = [
  columnHelper.accessor('validator', {
    cell: (info) => (
      <>
        <NextLink
          href={`/validators/${info.row.original.validator}`}
          style={{ color: 'cornflowerblue', cursor: 'pointer' }}
        >
          {info.row.original.validator}
        </NextLink>
        <br />
        {info.row.original.tmAddress}
      </>
    ),
    header: 'Validator',
  }),
  columnHelper.accessor('moniker', {
    cell: (info) => info.getValue(),
    header: 'Moniker',
  }),
  columnHelper.accessor('uptime', {
    cell: (info) =>
      info.getValue() == 0
        ? 'Loading...'
        : Number(info.getValue()).toFixed(2) + '%',
    header: 'Up Time',
  }),
  columnHelper.accessor('votingPower', {
    cell: (info) => info.getValue(),
    header: 'Voting Power',
  }),
  columnHelper.accessor('commitSignatures', {
    cell: (info) => info.getValue(),
    header: 'Commit Signatures',
  }),
  columnHelper.accessor('participation', {
    cell: (info) => info.getValue().toFixed(2) + '%',
    header: 'Participation',
  }),
]

export default function Validators() {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchCurrentValidatorsList({ signal: controller.signal })
      .then(async (res: any) => {
        setTotal(res.length)
        console.log(search)
        const validators = search
          ? res
              .filter(
                (item: any) =>
                  item.address.includes(search) ||
                  item.moniker.includes(search) ||
                  item.operator_address.includes(search)
              )
              .slice(page * perPage, (page + 1) * perPage)
          : res.slice(page * perPage, (page + 1) * perPage)
        const lastedBlock = await fetchLastBlock().then((data) => {
          return data.header.height
        })

        // Set initial data with loading state
        const initialData = validators.map((val: any) => ({
          validator: val.address,
          tmAddress: val.operator_address,
          uptime: 0,
          votingPower: convertVotingPower(val.voting_power),
          participation: val.voting_percentage,
          commitSignatures: 'Loading...',
          moniker: val.moniker,
        }))
        setData(initialData)

        // Fetch actual data
        const promises = validators.map((val: any, index: number) => {
          const uptimePromise = fetchValidatorUptime(
            val.address,
            0,
            lastedBlock
          )
            .then((data) => (data.uptime * 100).toFixed(2) + '%')
            .catch(() => 'Loading...')

          const commitSignaturesPromise = fetchValidatorCommitSignatures(
            val.address
          )
            .then((data) => data)
            .catch(() => 'Loading...')

          return Promise.all([uptimePromise, commitSignaturesPromise]).then(
            ([uptime, commitSignatures]) => {
              setData((prevData) =>
                prevData.map((item, idx) =>
                  idx === index
                    ? {
                        validator: val.address,
                        uptime: parseFloat(uptime),
                        votingPower: convertVotingPower(val.voting_power),
                        participation: val.voting_percentage,
                        commitSignatures: commitSignatures,
                        moniker: val.moniker,
                        tmAddress: val.operator_address,
                      }
                    : item
                )
              )
            }
          )
        })

        await Promise.all(promises)
        setIsLoading(false)
      })
      .catch((e) => {
        console.log(e)
        // Ignore errors caused by aborting the fetch request
        if (e.name === 'AbortError') {
          return
        }
      })

    return () => {
      // Abort the fetch request when a new one is made
      controller.abort()
    }
  }, [page, perPage, search])

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
        <title>Blocks | Namada Explorer</title>
        <meta name="description" content="Blocks | Namada Explorer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HStack h="24px">
          <Heading size={'md'}>Validators</Heading>
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
          <Icon fontSize="16" as={FiShield} />
          <Text>Validators</Text>
        </HStack>

        <Box
          mt={8}
          bg={useColorModeValue('light-container', 'dark-container')}
          shadow={'base'}
          borderRadius={4}
          p={4}
        >
          <Input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by address or moniker or tendermint address"
            bg={useColorModeValue('white', 'gray.800')}
            border={1}
            color={'gray.500'}
            _placeholder={{ color: 'gray.500' }}
            mb={2} // Add margin bottom to separate the input from the box
            size="md"
            ml={4}
            maxWidth={500}
          />
          <DataTable
            columns={columns}
            data={data}
            total={total}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
          />
        </Box>
      </main>
    </>
  )
}
