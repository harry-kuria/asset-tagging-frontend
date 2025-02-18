import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Sidebar from './components/sidebar'
import PhoneSidebar from './components/phoneSidebar'
import Step_1 from './components/contents/step_1'
import Step_2 from './components/contents/step_2'
import Step_3 from './components/contents/step_3'
import Step_4 from './components/contents/step_4'
import Success from './components/success'
import '../Signup/style/style.css'

const CreateAccount = () => {
  const { currentStep } = useSelector((state) => state.StepReducer)
  const dispatch = useDispatch()

  switch (currentStep) {
    case 1: {
      return (
        <div className="first">
          <PhoneSidebar />
          {/* Will be displayed only on small screen viewers 😎*/}
          <Sidebar />
          <Step_1 dispatch={dispatch} />
        </div>
      )
    }
    case 2: {
      return (
        <div className="second">
          <PhoneSidebar />
          <Sidebar />
          <Step_2 dispatch={dispatch} />
        </div>
      )
    }
    case 3: {
      return (
        <div className="third">
          <PhoneSidebar />
          <Sidebar />
          <Step_4 dispatch={dispatch} />
        </div>
      )
    }
    case 4: {
      return (
        <div className="forth">
          <PhoneSidebar />
          <Sidebar />
          <Step_3 dispatch={dispatch} />
        </div>
      )
    }
    case 5: {
      return (
        <div className="fifth">
          <Success />
        </div>
      )
    }
    default: {
      return (
        <>
          <PhoneSidebar />
          <Sidebar />
          <Step_1 dispatch={dispatch} />
        </>
      )
    }
  }
}

export default CreateAccount
