import { useState, useEffect } from 'react'
import { Spinner } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import { LS_RPC_ADDRESS } from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'

export default function Connect() {
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [error, setError] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_RPC_URL)
    connectClient(process.env.NEXT_PUBLIC_RPC_URL || '')
  }, [])

  const connectClient = async (rpcAddress: string) => {
    try {
      setError(false)
      setState('submitting')

      if (!rpcAddress) {
        setError(true)
        setState('initial')
        return
      }

      const isValid = await validateConnection(rpcAddress)
      if (!isValid) {
        setError(true)
        setState('initial')
        return
      }

      const tmClient = await connectWebsocketClient(rpcAddress)

      if (!tmClient) {
        setError(true)
        setState('initial')
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))
      setState('success')

      window.localStorage.setItem(LS_RPC_ADDRESS, rpcAddress)
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  if (state === 'submitting') {
    return (
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
    )
  }

  if (error) {
    return <div>Error connecting to RPC</div>
  }
  return null
}
