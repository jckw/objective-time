"use client"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import "./globals.css"
import { useEffect } from "react"

type FormData = {
  dayStartTime: string
  dayEndTime: string
  currentTime: string
}

const timeString = z
  .string()
  .regex(
    /^\d{1,2}(?::\d{2})?$/,
    "Please enter a valid time in the form hh:mm or hh"
  )

const schema = z.object({
  dayStartTime: timeString,
  dayEndTime: timeString,
  currentTime: timeString,
})

export default function Home() {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      dayStartTime: "09:00",
      dayEndTime: "23:00",
      currentTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  useEffect(() => {
    const storedStartTime = localStorage.getItem("dayStartTime")
    const storedEndTime = localStorage.getItem("dayEndTime")

    if (storedStartTime) {
      setValue("dayStartTime", storedStartTime)
    }

    if (storedEndTime) {
      setValue("dayEndTime", storedEndTime)
    }
  }, [setValue])

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const startTime = event.target.value
    setValue("dayStartTime", startTime)
    localStorage.setItem("dayStartTime", startTime)
  }

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const endTime = event.target.value
    setValue("dayEndTime", endTime)
    localStorage.setItem("dayEndTime", endTime)
  }

  let [currentMins, endMins, startMins] = watch([
    "currentTime",
    "dayEndTime",
    "dayStartTime",
  ]).map((item) => {
    return item.split(":").reduce((acc, v) => acc * 60 + Number(v), 0)
  })

  if (endMins < startMins) {
    endMins += 24 * 60
  }
  if (currentMins < startMins) {
    currentMins += 24 * 60
  }

  let p: number
  let mode: "day" | "night"
  if (currentMins > endMins) {
    mode = "night"
    p = (currentMins - endMins) / (24 * 60 - (endMins - startMins))
  } else {
    mode = "day"
    p = (currentMins - startMins) / (endMins - startMins)
  }
  const displayP = Math.floor(p * 100)

  return (
    <div>
      <p>
        <b>Objective Time</b> is a time system based around when you start and
        end your waking day.
      </p>

      <hr />

      <label>
        Day start time
        <input {...register("dayStartTime")} onChange={handleStartTimeChange} />
        <div>
          {errors.dayStartTime && <span>{errors.dayStartTime.message}</span>}
        </div>
      </label>

      <label>
        Day end time
        <input {...register("dayEndTime")} onChange={handleEndTimeChange} />
        <div>
          {errors.dayEndTime && <span>{errors.dayEndTime.message}</span>}
        </div>
      </label>

      <label>
        Current time
        <input {...register("currentTime")} />
        <div>
          {errors.currentTime && <span>{errors.currentTime.message}</span>}
        </div>
      </label>

      <h1>
        {displayP}% through the {mode}
      </h1>
      <p>{100 - displayP}% remaining</p>
    </div>
  )
}
