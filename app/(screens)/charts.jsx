import { View, Text,ScrollView } from 'react-native'
import React from 'react'


import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart } from "react-native-gifted-charts";
// import { ScrollView } from 'react-native-web';

// ...
const data=[ {value:50}, {value:80}, {value:90}, {value:70} ]
const charts = () => {
  return (
    <View>
        <ScrollView>
      <Text>charts</Text>



<BarChart data = {data} />
<LineChart data = {data} />
<PieChart data = {data} />
<PopulationPyramid data = {[{left:10,right:12}, {left:9,right:8}]} />
<RadarChart data = {[50, 80, 90, 70]} />

{/* // For Horizontal Bar chart, just add the prop horizontal to the <BarChart/> component */}

<BarChart data = {data} horizontal />

{/* // For Area chart, just add the prop areaChart to the <LineChart/> component */}

<LineChart data = {data} areaChart />

{/* // For Donut chart, just add the prop donut to the <PieChart/> component */}

<PieChart data = {data} donut />
</ScrollView>
    </View>
  )
}

export default charts