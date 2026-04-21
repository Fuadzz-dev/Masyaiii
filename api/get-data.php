<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

include_once '../koneksi.php';

// Fetch the 50 most recent records to display in the chart
$sql = "SELECT kelUdara as airHumidity, kelTanah as soilHumidity, suhuUdara as temperature, kecerahan as light, reading_time as timestamp 
        FROM sensordata 
        ORDER BY id DESC LIMIT 50";
        
$result = $conn->query($sql);

$sensorData = array();

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['airHumidity'] = (float) $row['airHumidity'];
        $row['soilHumidity'] = (float) $row['soilHumidity'];
        $row['temperature'] = (float) $row['temperature'];
        $row['light'] = (float) $row['light'];
        // Format timestamp if needed, or leave it as it comes from DB
        // By default, reading_time is like "2024-05-12 14:30:00"
        $sensorData[] = $row;
    }
}

// Since we ordered by DESC (latest 50), the most recent is at index 0.
// But the frontend chart usually wants chronological order (oldest to newest for the left-to-right axis)
// So we should reverse the array before sending.
$sensorData = array_reverse($sensorData);

echo json_encode($sensorData);

$conn->close();
?>
