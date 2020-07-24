import React, { useState, useEffect } from "react"
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core"
import InfoxBox from "./InfoBox"
import Map from "./Map"
import Table from "./Table"
import { sortData, prettyPrintStaf } from "./util"
import LineGraph from "./LineGraph"
import "leaflet/dist/leaflet.css"

import "./App.css"

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("wordlwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCounties, setMapCounties] = useState([])
  const [casesType, setCasesType] = useState("cases")

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
      })
  }, [])
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2
          }))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCounties(data)
          setCountries(countries)
        })
    }
    getCountriesData()
  }, [])

  const onCountryChange = async event => {
    const countryCode = event.target.value
    setCountry(countryCode)
    const url = countryCode === "wordlwide" ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode} `
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data)
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
  }
  console.log("Infoo", countryInfo)
  return (
    <div className="app">
      <div className="app_left">
        <dir className="app_header">
          <h1> COVID-19 TRACKER</h1>
          <FormControl className="app_dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="wordlwide">wordlwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </dir>
        <div className="app_stats">
          <InfoxBox isRed active={casesType === "cases"} onClick={e => setCasesType("cases")} title="Coronavarus Cases" cases={prettyPrintStaf(countryInfo.todayCases)} total={prettyPrintStaf(countryInfo.cases)} />

          <InfoxBox active={casesType === "recovered"} onClick={e => setCasesType("recovered")} title="Recovered" cases={prettyPrintStaf(countryInfo.todayRecovered)} total={prettyPrintStaf(countryInfo.recovered)} />

          <InfoxBox isRed active={casesType === "deaths"} onClick={e => setCasesType("deaths")} title="Deaths" cases={prettyPrintStaf(countryInfo.todayDeaths)} total={prettyPrintStaf(countryInfo.deaths)} />
        </div>
        <Map casesType={casesType} countries={mapCounties} center={mapCenter} zoom={mapZoom} />
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Lives Cases by country</h3>
          <Table countries={tableData} />

          <h3 className="app_graphTitle">Wordlwide New {casesType}</h3>
          <LineGraph className="app_graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
