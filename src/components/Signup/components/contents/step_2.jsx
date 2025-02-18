import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../../style/style.css'
import {
  nextStepAction,
  prevStepAction,
  addPlanTypeAction,
  addPeriodTypeAction,
} from '../../store/actions'

const Step_2 = () => {
  const dispatch = useDispatch()

  const state = useSelector((state) => state)
  const usersPlanReducer = state.usersPlanReducer //Taking the users plan be as default values when returning back

  var planType = usersPlanReducer.planType
  var periodType = usersPlanReducer.periodType

  const handlePlanType = (x) => {
    planType = x
    dispatch(addPlanTypeAction(planType))
  }

  const handlePeriodType = (e) => {
    periodType = periodType === 'monthly' ? 'yearly' : 'monthly'
    dispatch(addPeriodTypeAction(periodType))

    let text_monthly = e.target.parentNode.querySelector('p.text_monthly')
    let text_yearly = e.target.parentNode.querySelector('p.text_yearly')

    if (e.target.checked) {
      text_yearly.style.color = 'var(--Marine-blue)'
      text_monthly.style.color = 'var(--Cool-gray)'
    } else {
      text_yearly.style.color = 'var(--Cool-gray)'
      text_monthly.style.color = 'var(--Marine-blue)'
    }
  }

  const handleNextStep = () => {
    dispatch(nextStepAction())
  }
  const handlePrevStep = () => {
    dispatch(prevStepAction())
  }

  useEffect(() => {
    //Setting the active classes for the clicked box after renders complete
    let box = document.querySelectorAll('.box')

    if (planType === 'pro') {
      box[0].classList.remove('active')
      box[1].classList.remove('active')
    } else if (planType === 'advanced') {
      box[0].classList.remove('active')
      box[1].classList.add('active')
    } else {
      //default
      box[0].classList.add('active')
      box[1].classList.remove('active')
    }

    //The offer when periodType is yearly
    let offer_elem = document.querySelectorAll('.offer')

    offer_elem.forEach((e) => {
      e.innerText = periodType === 'yearly' ? '' : ''
    })

    //The active color for either monthly or yearly text
  })

  //The fees
  let arcade_fee = periodType === 'monthly' ? '$20/mo' : '$150/yr',
    advance_fee = periodType === 'monthly' ? '$150/yr' : '$200/yr',
    pro_fee = periodType === 'monthly' ? '$25/mo' : '$250/yr'

  return (
    <>
      <section id="step_2">
        <div className="part_1">
          <h1>Select your plan</h1>
          {/* <p>You have the option of monthly or yearly billing.</p> */}
        </div>

        <div className="part_2">
          <div className="box" onClick={() => handlePlanType('arcade')}>
            <div className="icon_part">
              <img src="../assets/images/icon-arcade.svg" alt="arcade icon" />
            </div>

            <div className="text_part">
              <h3>Monthly</h3>
              <p className="fee">{arcade_fee}</p>
              <p className="offer"></p>
            </div>
          </div>

          <div className="box" onClick={() => handlePlanType('advanced')}>
            <div className="icon_part">
              <img src="../assets/images/icon-advanced.svg" alt="advanced icon" />
            </div>

            <div className="text_part">
              <h3>Yearly</h3>
              <p className="fee">{advance_fee}</p>
              <p className="offer"></p>
            </div>
          </div>
        </div>

        <div className="part_4">
          <div className="btn_1">
            <p onClick={handlePrevStep}>Go Back</p>
          </div>

          <div className="btn_2">
            <button className="btn" onClick={handleNextStep}>
              Next Step
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default Step_2
