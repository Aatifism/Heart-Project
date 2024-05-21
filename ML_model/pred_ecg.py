import tensorflow as tf 
import matplotlib.pyplot as plt
import cv2
import os
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.preprocessing import image

img = image.load_img("C:/Users/aatif/Pictures/computer_vision/basedata/training/high/Screenshot 2023-06-10 155826.png")
plt.imshow(img)
cv2.imread("C:/Users/aatif/Pictures/computer_vision/basedata/training/high/Screenshot 2023-06-10 155826.png").shape

train = ImageDataGenerator(rescale=1/255)
validation = ImageDataGenerator(rescale=1/255)

train_dataset = train.flow_from_directory("C:/Users/aatif/Pictures/computer_vision/basedata/training",
                                         target_size=(100, 200),
                                         batch_size=3,
                                         class_mode='binary')

validation_dataset = validation.flow_from_directory("C:/Users/aatif/Pictures/computer_vision/basedata/validation",
                                                    target_size=(100, 200),
                                                    batch_size=3,
                                                    class_mode='binary')

model = tf.keras.models.Sequential([
    tf.keras.layers.Conv2D(16, (3, 3), activation='relu', input_shape=(100, 200, 3)),
    tf.keras.layers.MaxPool2D(2, 2),
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),                               
    tf.keras.layers.MaxPool2D(2, 2), 
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),                               
    tf.keras.layers.MaxPool2D(2, 2),     
    tf.keras.layers.Flatten(),                             
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

from tensorflow.keras.optimizers import RMSprop

model.compile(loss='binary_crossentropy',
              optimizer=RMSprop(learning_rate=0.001),
              metrics=['accuracy'])

model_fit = model.fit(train_dataset,
                      steps_per_epoch=2,
                      epochs=30,
                      validation_data=validation_dataset)

dir_path = 'C:/Users/aatif/Pictures/computer_vision/basedata/testing'

# Create a text file to store the output
output_file = open('output.txt', 'w')

for i in os.listdir(dir_path):
    img = image.load_img(dir_path + '/' + i, target_size=(100, 200))
    plt.imshow(img)
    plt.show()

    X = image.img_to_array(img)
    X = np.expand_dims(X, axis=0)
    images = np.vstack([X])
    val = model.predict(images)

    if val == 0:
        output = "Risk of heart attack is high"
        print(output)
    else:
        output = "Risk of heart attack is low"
        print(output)

    # Write the output to the text file
    output_file.write(output + '\n')

# Close the text file
output_file.close()

print("Output saved to output.txt")
