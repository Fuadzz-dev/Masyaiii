<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

include_once '../koneksi.php';

$api_key_value = "MentimunBesar";

// Create table if not exists (for convenience)
$table_sql = "CREATE TABLE IF NOT EXISTS sensordata (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kelTanah FLOAT NOT NULL,
    kelUdara FLOAT NOT NULL,
    suhuUdara FLOAT NOT NULL,
    kecerahan FLOAT NOT NULL,
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($table_sql);

// Handle POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Determine data source: JSON body or form variables
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    $api_key_provided = "";
    if ($data !== null && isset($data->api_key)) {
        $api_key_provided = $data->api_key;
    } else if (isset($_POST['api_key'])) {
        $api_key_provided = $_POST['api_key'];
    }

    if ($api_key_provided !== $api_key_value) {
        http_response_code(401); // Unauthorized
        echo json_encode(["message" => "Otentikasi gagal: API Key salah atau tidak disediakan!"]);
        exit();
    }

    if (isset($data->airHumidity)) {
        $airHumidity = $data->airHumidity;
        $soilHumidity = $data->soilHumidity;
        $temperature = $data->temperature;
        $light = $data->light;
    } else {
        $airHumidity = isset($_POST['airHumidity']) ? $_POST['airHumidity'] : null;
        $soilHumidity = isset($_POST['soilHumidity']) ? $_POST['soilHumidity'] : null;
        $temperature = isset($_POST['temperature']) ? $_POST['temperature'] : null;
        $light = isset($_POST['light']) ? $_POST['light'] : null;
    }

    if ($airHumidity !== null && $soilHumidity !== null && $temperature !== null && $light !== null) {
        // Sanitize data
        $airHumidity = $conn->real_escape_string($airHumidity);
        $soilHumidity = $conn->real_escape_string($soilHumidity);
        $temperature = $conn->real_escape_string($temperature);
        $light = $conn->real_escape_string($light);

        $sql = "INSERT INTO sensordata (kelUdara, kelTanah, suhuUdara, kecerahan) 
                VALUES ('$airHumidity', '$soilHumidity', '$temperature', '$light')";

        if ($conn->query($sql) === TRUE) {
            // Automatic Pump Control Logic
            $result = $conn->query("SELECT is_active, mode FROM pump_control WHERE id = 1");
            if ($result && $row = $result->fetch_assoc()) {
                $mode = $row['mode'];
                $current_is_active = (int)$row['is_active'];
                
                if ($mode === 'auto') {
                    $new_is_active = $current_is_active;
                    $soil_val = (float)$soilHumidity;
                    
                    if ($soil_val < 40.0) {
                        $new_is_active = 1;
                    } else if ($soil_val >= 83.0) {
                        $new_is_active = 0;
                    }
                    
                    if ($new_is_active !== $current_is_active) {
                        $conn->query("UPDATE pump_control SET is_active = $new_is_active WHERE id = 1");
                    }
                }
            }

            echo json_encode(["message" => "Data berhasil disimpan"]);
        } else {
            echo json_encode(["message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } else {
        echo json_encode(["message" => "Data tidak lengkap"]);
    }
} else {
    echo json_encode(["message" => "Gunakan metode POST untuk mengirim data"]);
}

$conn->close();
?>
