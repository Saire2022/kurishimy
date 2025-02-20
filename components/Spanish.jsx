import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'

export default function Spanish() {
return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. 
          Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at 
          nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec 
          tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. 
          Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos 
          himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. 
          Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. 
          Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. 
          Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis 
          ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, 
          euismod in, nibh.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    height: '50%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  text: {
    fontSize: 24,
    color: '#333',
  },
});
